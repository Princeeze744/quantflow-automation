import { FastifyInstance } from 'fastify'
import prisma from '../services/db.js'
import { authenticate } from '../middleware/auth.js'

export default async function importRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // Import trades from CSV data (parsed on frontend)
  app.post('/csv', async (request) => {
    const { userId } = (request as any).user
    const { trades: csvTrades, source } = request.body as {
      trades: Array<{
        pair: string
        direction: string
        entryPrice: number
        exitPrice: number
        stopLoss?: number
        takeProfit?: number
        lotSize: number
        commission?: number
        swap?: number
        entryTime: string
        exitTime: string
      }>
      source: string
    }

    if (!csvTrades || csvTrades.length === 0) {
      return { imported: 0, errors: ['No trades found in data'] }
    }

    let imported = 0
    const errors: string[] = []

    for (const row of csvTrades) {
      try {
        // Calculate fields
        const pipMultiplier = row.pair.includes('JPY') ? 100 : 10000
        const rawPips = (row.exitPrice - row.entryPrice) * pipMultiplier
        const pnlPips = row.direction === 'LONG' ? rawPips : -rawPips
        const pnlDollars = pnlPips * row.lotSize * (row.pair.includes('JPY') ? 100 : 10)

        let rrActual = null
        if (row.stopLoss) {
          const slDist = Math.abs(row.entryPrice - row.stopLoss)
          const tradeDist = Math.abs(row.exitPrice - row.entryPrice)
          if (slDist > 0) {
            const rr = tradeDist / slDist
            rrActual = pnlDollars >= 0 ? rr : -rr
          }
        }

        const holdMs = new Date(row.exitTime).getTime() - new Date(row.entryTime).getTime()
        const holdDurationMin = Math.round(holdMs / 60000)

        const entryHour = new Date(row.entryTime).getUTCHours()
        let session = 'LONDON'
        if (entryHour >= 21 || entryHour < 6) session = 'SYDNEY'
        else if (entryHour >= 0 && entryHour < 9) session = 'TOKYO'
        else if (entryHour >= 13 && entryHour < 16) session = 'OVERLAP'
        else if (entryHour >= 13 && entryHour < 22) session = 'NEWYORK'

        await prisma.trade.create({
          data: {
            userId,
            pair: row.pair,
            direction: row.direction,
            entryPrice: row.entryPrice,
            exitPrice: row.exitPrice,
            stopLoss: row.stopLoss || null,
            takeProfit: row.takeProfit || null,
            lotSize: row.lotSize,
            commission: row.commission || 0,
            swap: row.swap || 0,
            pnlDollars,
            pnlPips,
            rrActual,
            holdDurationMin,
            session,
            entryTime: new Date(row.entryTime),
            exitTime: new Date(row.exitTime),
            status: 'CLOSED',
            source: source || 'MT4',
          },
        })
        imported++
      } catch (err: any) {
        errors.push(`Row ${imported + errors.length + 1}: ${err.message}`)
      }
    }

    return { imported, total: csvTrades.length, errors }
  })
}
