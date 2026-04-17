import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Flame,
  Zap,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
} from 'lucide-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import LiveChart from '../components/ui/LiveChart'
import { useTradeStore } from '../stores/tradeStore'
import Tiltmeter from '../components/ui/Tiltmeter'
import WhatIfSimulator from '../components/trade/WhatIfSimulator'
import { useAuthStore } from '../stores/authStore'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
}

const sessions = [
  { name: 'TOKYO', startUTC: 0, endUTC: 9, time: '00:00 - 09:00 UTC' },
  { name: 'LONDON', startUTC: 7, endUTC: 16, time: '07:00 - 16:00 UTC' },
  { name: 'NEW YORK', startUTC: 13, endUTC: 22, time: '13:00 - 22:00 UTC' },
  { name: 'SYDNEY', startUTC: 21, endUTC: 6, time: '21:00 - 06:00 UTC' },
]

const isActive = (start: number, end: number) => {
  const h = new Date().getUTCHours()
  if (start < end) return h >= start && h < end
  return h >= start || h < end
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { trades, analytics, fetchTrades, fetchAnalytics } = useTradeStore()

  useEffect(() => {
    fetchTrades()
    fetchAnalytics()
  }, [fetchTrades, fetchAnalytics])

  const a = analytics
  const todayStr = new Date().toISOString().split('T')[0]
  const todayTrades = trades.filter((t) => t.entryTime?.startsWith(todayStr))
  const todayPnl = todayTrades.reduce((sum, t) => sum + (t.pnlDollars || 0), 0)

  const recentTrades = trades.slice(0, 5)

  const stats = [
    {
      label: 'Today P&L',
      value: Math.abs(todayPnl),
      prefix: todayPnl >= 0 ? '+$' : '-$',
      decimals: 2,
      change: todayTrades.length > 0 ? `${todayTrades.length} trade${todayTrades.length > 1 ? 's' : ''} today` : 'No trades today',
      icon: DollarSign,
      positive: todayPnl >= 0,
      glow: todayPnl >= 0 ? 'from-brand-profit/20 to-brand-cyan/10' : 'from-brand-loss/20 to-brand-loss/5',
      iconBg: todayPnl >= 0 ? 'bg-brand-profit/10' : 'bg-brand-loss/10',
      iconColor: todayPnl >= 0 ? 'text-brand-profit' : 'text-brand-loss',
    },
    {
      label: 'Win Rate',
      value: a?.winRate || 0,
      suffix: '%',
      decimals: 1,
      change: a && a.totalTrades > 0 ? `${a.wins}W / ${a.losses}L` : 'No trades yet',
      icon: Target,
      positive: (a?.winRate || 0) >= 50,
      glow: 'from-brand-cyan/20 to-brand-violet/10',
      iconBg: 'bg-brand-cyan/10',
      iconColor: 'text-brand-cyan',
    },
    {
      label: 'Total P&L',
      value: Math.abs(a?.totalPnl || 0),
      prefix: (a?.totalPnl || 0) >= 0 ? '+$' : '-$',
      decimals: 2,
      change: a?.profitFactor ? `PF: ${a.profitFactor}` : 'Start trading',
      icon: Activity,
      positive: (a?.totalPnl || 0) >= 0,
      glow: 'from-brand-violet/20 to-brand-cyan/10',
      iconBg: 'bg-brand-violet/10',
      iconColor: 'text-brand-violet',
    },
    {
      label: 'Expectancy',
      value: Math.abs(a?.expectancy || 0),
      prefix: (a?.expectancy || 0) >= 0 ? '+$' : '-$',
      decimals: 2,
      change: a?.avgRR ? `Avg R:R ${a.avgRR}` : 'Per trade average',
      icon: Flame,
      positive: (a?.expectancy || 0) >= 0,
      glow: 'from-brand-cyan/20 to-brand-profit/10',
      iconBg: 'bg-brand-cyan/10',
      iconColor: 'text-brand-cyan',
    },
  ]

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6"
      >
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <motion.h1
              className="text-2xl sm:text-3xl font-display font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-brand-text">Command </span>
              <span className="text-gradient">Center</span>
            </motion.h1>
            <p className="text-xs sm:text-sm text-brand-silver mt-1 font-body">
              Welcome back, {user?.displayName || 'Trader'} — your edge starts here.
            </p>
          </div>
          <motion.div
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl glass-card border-brand-profit/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="pulse-dot" />
            <span className="text-xs font-mono text-brand-profit">Markets Open</span>
          </motion.div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={item}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card-hover p-4 sm:p-5 relative overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[9px] sm:text-[11px] font-semibold text-brand-silver uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <motion.div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                  </motion.div>
                </div>
                <div className="text-xl sm:text-2xl text-brand-text">
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix || ''}
                    suffix={stat.suffix || ''}
                    decimals={stat.decimals}
                    duration={1800 + i * 200}
                  />
                </div>
                <div className="flex items-center gap-1 mt-1 sm:mt-2">
                  {stat.positive ? (
                    <ArrowUpRight className="w-3 h-3 text-brand-profit" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-brand-loss" />
                  )}
                  <span className={`text-[9px] sm:text-xs ${stat.positive ? 'text-brand-profit' : 'text-brand-loss'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Chart */}
        <motion.div variants={item} className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-cyan" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-display font-semibold text-brand-text">Market Pulse</h2>
                <p className="text-[9px] sm:text-[11px] text-brand-silver">Live trading activity</p>
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2">
              {['1H', '4H', '1D', '1W'].map((tf) => (
                <button
                  key={tf}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[11px] font-mono font-medium transition-all ${
                    tf === '1H'
                      ? 'bg-brand-cyan/15 text-brand-cyan'
                      : 'text-brand-silver hover:text-brand-text hover:bg-white/5'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="h-52 sm:h-72 rounded-xl overflow-hidden">
            <LiveChart />
          </div>
        </motion.div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Trades */}
          <motion.div variants={item} className="lg:col-span-1 glass-card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <Zap className="w-4 h-4 text-brand-cyan" />
              <h2 className="text-xs sm:text-sm font-display font-semibold text-brand-text">Recent Trades</h2>
            </div>

            {recentTrades.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-brand-cyan/20 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-brand-silver">No trades yet</p>
                  <p className="text-[10px] text-brand-silver/60 mt-1">Log your first trade in the Journal</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentTrades.map((trade, i) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                        (trade.pnlDollars || 0) >= 0 ? 'bg-brand-profit/10' : 'bg-brand-loss/10'
                      }`}>
                        {(trade.pnlDollars || 0) >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-profit" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-loss" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-mono font-semibold text-brand-text">{trade.pair}</p>
                        <p className="text-[8px] sm:text-[10px] text-brand-silver">{trade.direction} · {formatTime(trade.entryTime)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs sm:text-sm font-mono font-bold ${(trade.pnlDollars || 0) >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                        {(trade.pnlDollars || 0) >= 0 ? '+' : ''}${(trade.pnlDollars || 0).toFixed(2)}
                      </p>
                      <p className={`text-[8px] sm:text-[10px] font-mono ${(trade.pnlDollars || 0) >= 0 ? 'text-brand-profit/60' : 'text-brand-loss/60'}`}>
                        {(trade.rrActual || 0) >= 0 ? '+' : ''}{(trade.rrActual || 0).toFixed(2)}R
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* AI Briefing */}
          <motion.div variants={item} className="lg:col-span-1 glass-card p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-violet/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-brand-violet/20 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-violet" />
                </div>
                <h2 className="text-xs sm:text-sm font-display font-semibold text-brand-text">AI Coach Insight</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 rounded-xl bg-brand-violet/5 border border-brand-violet/10">
                  {a && a.totalTrades > 0 ? (
                    <p className="text-[11px] sm:text-[13px] text-brand-text leading-relaxed">
                      "You've taken <span className="text-brand-cyan font-semibold">{a.totalTrades} trades</span> with a
                      <span className={`font-semibold ${a.winRate >= 50 ? ' text-brand-profit' : ' text-brand-loss'}`}> {a.winRate}% win rate</span>.
                      {a.profitFactor >= 1.5 ? ' Your profit factor is strong — keep this consistency.' : ' Focus on improving your R:R to boost profitability.'}
                    </p>
                  ) : (
                    <p className="text-[11px] sm:text-[13px] text-brand-text leading-relaxed">
                      "Welcome to Quantflow! Start logging trades to unlock AI-powered insights tailored to your trading patterns."
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-[9px] sm:text-[10px] text-brand-silver flex items-center gap-1">
                    <Flame className="w-3 h-3 text-brand-violet" />
                    Powered by Trade2Retire Academy AI
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Session Clock + Quick Stats */}
          <motion.div variants={item} className="lg:col-span-1 space-y-3 sm:space-y-4">
            <div className="glass-card p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Clock className="w-4 h-4 text-brand-cyan" />
                <h2 className="text-xs sm:text-sm font-display font-semibold text-brand-text">Session Clock</h2>
              </div>
              <div className="space-y-2">
                {sessions.map((session) => {
                  const active = isActive(session.startUTC, session.endUTC)
                  return (
                    <div key={session.name} className="flex items-center justify-between py-1.5 sm:py-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${active ? 'bg-brand-profit animate-pulse' : 'bg-brand-silver/30'}`} />
                        <span className={`text-[10px] sm:text-xs font-mono font-semibold ${active ? 'text-brand-text' : 'text-brand-silver/50'}`}>
                          {session.name}
                        </span>
                      </div>
                      <span className="text-[8px] sm:text-[10px] font-mono text-brand-silver">{session.time}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="glass-card p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <BarChart3 className="w-4 h-4 text-brand-profit" />
                <h2 className="text-xs sm:text-sm font-display font-semibold text-brand-text">Overall Stats</h2>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {[
                  { label: 'Total Trades', value: a?.totalTrades?.toString() || '0', color: 'text-brand-text' },
                  { label: 'Profit Factor', value: a?.profitFactor?.toString() || '-', color: 'text-brand-cyan' },
                  { label: 'Best Trade', value: a?.bestTrade ? `+$${a.bestTrade.pnl?.toFixed(0)}` : '-', color: 'text-brand-profit' },
                  { label: 'Max Drawdown', value: a?.maxDrawdown ? `${a.maxDrawdown}%` : '-', color: 'text-brand-loss' },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] text-brand-silver">{metric.label}</span>
                    <span className={`text-xs sm:text-sm font-mono font-bold ${metric.color}`}>{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

