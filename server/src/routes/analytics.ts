import { FastifyInstance } from 'fastify'
import prisma from '../services/db.js'
import { authenticate } from '../middleware/auth.js'

export default async function analyticsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/overview', async (request) => {
    const { userId } = (request as any).user

    const trades = await prisma.trade.findMany({
      where: { userId, status: 'CLOSED' },
      include: { psychology: true, tradeTags: { include: { tag: true } } },
      orderBy: { entryTime: 'asc' },
    })

    if (trades.length === 0) {
      return {
        totalTrades: 0, wins: 0, losses: 0, winRate: 0,
        totalPnl: 0, avgRR: 0, profitFactor: 0,
        expectancy: 0, maxDrawdown: 0, avgHoldTime: 0,
        bestTrade: null, worstTrade: null,
        currentStreak: 0, longestWinStreak: 0, longestLossStreak: 0,
        byPair: [], bySession: [], bySetup: [], byDay: [], byHour: [],
        equityCurve: [], pnlCalendar: [],
      }
    }

    const wins = trades.filter((t) => (t.pnlDollars || 0) > 0)
    const losses = trades.filter((t) => (t.pnlDollars || 0) < 0)
    const winRate = (wins.length / trades.length) * 100

    const totalPnl = trades.reduce((sum, t) => sum + (t.pnlDollars || 0), 0)
    const grossProfit = wins.reduce((sum, t) => sum + (t.pnlDollars || 0), 0)
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnlDollars || 0), 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0

    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0
    const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss

    const avgRR = trades.reduce((sum, t) => sum + Math.abs(t.rrActual || 0), 0) / trades.length
    const avgHoldTime = trades.reduce((sum, t) => sum + (t.holdDurationMin || 0), 0) / trades.length

    // Equity curve
    let balance = 0
    const equityCurve = trades.map((t) => {
      balance += t.pnlDollars || 0
      return { date: t.exitTime || t.entryTime, balance }
    })

    // Max drawdown
    let peak = 0
    let maxDrawdown = 0
    equityCurve.forEach((point) => {
      if (point.balance > peak) peak = point.balance
      const dd = ((point.balance - peak) / (peak || 1)) * 100
      if (dd < maxDrawdown) maxDrawdown = dd
    })

    // Streaks
    let currentStreak = 0
    let longestWinStreak = 0
    let longestLossStreak = 0
    let tempWin = 0
    let tempLoss = 0
    trades.forEach((t) => {
      if ((t.pnlDollars || 0) > 0) {
        tempWin++
        tempLoss = 0
        if (tempWin > longestWinStreak) longestWinStreak = tempWin
      } else {
        tempLoss++
        tempWin = 0
        if (tempLoss > longestLossStreak) longestLossStreak = tempLoss
      }
    })
    const lastTrade = trades[trades.length - 1]
    currentStreak = (lastTrade.pnlDollars || 0) > 0 ? tempWin : -tempLoss

    // By pair
    const pairMap = new Map<string, typeof trades>()
    trades.forEach((t) => {
      const arr = pairMap.get(t.pair) || []
      arr.push(t)
      pairMap.set(t.pair, arr)
    })
    const byPair = Array.from(pairMap.entries()).map(([pair, pts]) => ({
      pair,
      trades: pts.length,
      winRate: (pts.filter((t) => (t.pnlDollars || 0) > 0).length / pts.length) * 100,
      pnl: pts.reduce((s, t) => s + (t.pnlDollars || 0), 0),
    }))

    // By session
    const sessionMap = new Map<string, typeof trades>()
    trades.forEach((t) => {
      const s = t.session || 'UNKNOWN'
      const arr = sessionMap.get(s) || []
      arr.push(t)
      sessionMap.set(s, arr)
    })
    const bySession = Array.from(sessionMap.entries()).map(([session, sts]) => ({
      session,
      trades: sts.length,
      winRate: (sts.filter((t) => (t.pnlDollars || 0) > 0).length / sts.length) * 100,
      pnl: sts.reduce((s, t) => s + (t.pnlDollars || 0), 0),
    }))

    // P&L Calendar
    const calMap = new Map<string, number>()
    trades.forEach((t) => {
      const date = (t.exitTime || t.entryTime).toISOString().split('T')[0]
      calMap.set(date, (calMap.get(date) || 0) + (t.pnlDollars || 0))
    })
    const pnlCalendar = Array.from(calMap.entries()).map(([date, pnl]) => ({ date, pnl }))

    const bestTrade = [...trades].sort((a, b) => (b.pnlDollars || 0) - (a.pnlDollars || 0))[0]
    const worstTrade = [...trades].sort((a, b) => (a.pnlDollars || 0) - (b.pnlDollars || 0))[0]

    return {
      totalTrades: trades.length,
      wins: wins.length,
      losses: losses.length,
      winRate: Math.round(winRate * 10) / 10,
      totalPnl: Math.round(totalPnl * 100) / 100,
      avgRR: Math.round(avgRR * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      expectancy: Math.round(expectancy * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 10) / 10,
      avgHoldTime: Math.round(avgHoldTime),
      bestTrade: bestTrade ? { pair: bestTrade.pair, pnl: bestTrade.pnlDollars } : null,
      worstTrade: worstTrade ? { pair: worstTrade.pair, pnl: worstTrade.pnlDollars } : null,
      currentStreak,
      longestWinStreak,
      longestLossStreak,
      byPair,
      bySession,
      equityCurve,
      pnlCalendar,
    }
  })
}
