import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  TrendingUp,
  DollarSign,
  Flame,
  BarChart3,
  Percent,
  Shield,
  Zap,
  Loader2,
} from 'lucide-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import StatCard from '../components/ui/StatCard'
import EquityCurve from '../components/analytics/EquityCurve'
import PerformanceHeatmap from '../components/analytics/PerformanceHeatmap'
import PairBreakdown from '../components/analytics/PairBreakdown'
import PnlCalendar from '../components/analytics/PnlCalendar'
import { useTradeStore } from '../stores/tradeStore'
import Tiltmeter from '../components/ui/Tiltmeter'
import WhatIfSimulator from '../components/trade/WhatIfSimulator'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
}

export default function Analytics() {
  const { analytics, trades, isLoading, fetchAnalytics, fetchTrades } = useTradeStore()

  useEffect(() => {
    fetchAnalytics()
    fetchTrades()
  }, [fetchAnalytics, fetchTrades])

  const a = analytics

  if (isLoading && !a) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
      </div>
    )
  }

  const formatMinutes = (mins: number) => {
    if (!mins) return '-'
    if (mins < 60) return `${mins}m`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
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
        <motion.div variants={item}>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">
            <span className="text-brand-text">Analytics </span>
            <span className="text-gradient">Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-silver mt-1">
            {a && a.totalTrades > 0
              ? `Analyzing ${a.totalTrades} trades — here's your edge.`
              : 'Start logging trades to unlock your analytics.'}
          </p>
        </motion.div>

        {a && a.totalTrades > 0 ? (
          <>
            {/* Top Stats */}
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Win Rate" value={`${(a.winRate ?? 0)}%`} icon={Target} color={a.winRate >= 50 ? 'text-brand-profit' : 'text-brand-loss'} iconBg={a.winRate >= 50 ? 'bg-brand-profit/10' : 'bg-brand-loss/10'} subtitle={`${a.wins}W / ${a.losses}L`} positive={a.winRate >= 50} />
              <StatCard label="Profit Factor" value={a.profitFactor === Infinity ? '∞' : (a.profitFactor ?? 0).toString()} icon={BarChart3} color="text-brand-cyan" iconBg="bg-brand-cyan/10" subtitle={a.profitFactor >= 1.5 ? 'Above target' : 'Below 1.5 target'} positive={a.profitFactor >= 1.5} />
              <StatCard label="Expectancy" value={`${a.expectancy >= 0 ? '+' : ''}$${a.expectancy.toFixed(2)}`} icon={Zap} color={a.expectancy >= 0 ? 'text-brand-violet' : 'text-brand-loss'} iconBg="bg-brand-violet/10" subtitle="Per trade average" positive={a.expectancy >= 0} />
              <StatCard label="Max Drawdown" value={`${a.maxDrawdown.toFixed(1)}%`} icon={Shield} color="text-brand-loss" iconBg="bg-brand-loss/10" subtitle={Math.abs(a.maxDrawdown) <= 10 ? 'Within limit' : 'Exceeds 10% limit'} positive={Math.abs(a.maxDrawdown) <= 10} />
            </motion.div>

            {/* Second Row */}
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Total P&L" value={`${a.totalPnl >= 0 ? '+' : ''}$${a.totalPnl.toFixed(2)}`} icon={DollarSign} color={a.totalPnl >= 0 ? 'text-brand-profit' : 'text-brand-loss'} iconBg={a.totalPnl >= 0 ? 'bg-brand-profit/10' : 'bg-brand-loss/10'} subtitle="All time" positive={a.totalPnl >= 0} />
              <StatCard label="Avg R:R" value={`${a.avgRR}:1`} icon={Percent} color="text-brand-violet" iconBg="bg-brand-violet/10" subtitle={a.avgRR >= 1.5 ? 'Solid ratio' : 'Below 1.5 target'} positive={a.avgRR >= 1.5} />
              <StatCard label="Avg Hold Time" value={formatMinutes(a.avgHoldTime)} icon={Flame} color="text-brand-cyan" iconBg="bg-brand-cyan/10" subtitle={`${a.totalTrades} trades analyzed`} />
              <StatCard label="Best Trade" value={a.bestTrade ? `+$${a.bestTrade.pnl?.toFixed(0)}` : '-'} icon={TrendingUp} color="text-brand-profit" iconBg="bg-brand-profit/10" subtitle={a.bestTrade?.pair || '-'} positive />
            </motion.div>

            {/* Equity Curve */}
            <motion.div variants={item}>
              <EquityCurve />
            </motion.div>

            {/* Calendar + Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <motion.div variants={item}>
                <PnlCalendar />
              </motion.div>
              <motion.div variants={item}>
                <PerformanceHeatmap />
              </motion.div>
            </div>

            {/* Pair Breakdown */}
            <motion.div variants={item}>
              <PairBreakdown />
            </motion.div>

            {/* Streaks & Sessions & Discipline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Streaks */}
              <motion.div variants={item} className="glass-card p-4 sm:p-5">
                <h3 className="text-xs sm:text-sm font-display font-semibold text-brand-text mb-3">Streaks</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Current Streak', value: `${a.currentStreak > 0 ? a.currentStreak + 'W' : Math.abs(a.currentStreak) + 'L'}`, color: a.currentStreak > 0 ? 'text-brand-profit' : 'text-brand-loss' },
                    { label: 'Best Win Streak', value: `${a.longestWinStreak}W`, color: 'text-brand-profit' },
                    { label: 'Worst Loss Streak', value: `${a.longestLossStreak}L`, color: 'text-brand-loss' },
                    { label: 'Worst Trade', value: a.worstTrade ? `-$${Math.abs(a.worstTrade.pnl || 0).toFixed(0)}` : '-', color: 'text-brand-loss' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-brand-silver">{s.label}</span>
                      <span className={`text-sm sm:text-base font-mono font-bold ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* By Session */}
              <motion.div variants={item} className="glass-card p-4 sm:p-5">
                <h3 className="text-xs sm:text-sm font-display font-semibold text-brand-text mb-3">By Session</h3>
                <div className="space-y-3">
                  {a.bySession.length > 0 ? a.bySession.map((s) => (
                    <div key={s.session} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs font-mono text-brand-text">{s.session}</span>
                        <span className="text-[8px] sm:text-[9px] text-brand-silver">{s.trades} trades</span>
                      </div>
                      <span className={`text-sm sm:text-base font-mono font-bold ${s.winRate >= 60 ? 'text-brand-profit' : s.winRate >= 50 ? 'text-yellow-400' : 'text-brand-loss'}`}>
                        {s.winRate.toFixed(0)}%
                      </span>
                    </div>
                  )) : (
                    <p className="text-xs text-brand-silver">Log trades to see session breakdown</p>
                  )}
                </div>
              </motion.div>

              {/* By Pair Quick */}
              <motion.div variants={item} className="glass-card p-4 sm:p-5">
                <h3 className="text-xs sm:text-sm font-display font-semibold text-brand-text mb-3">Top Pairs</h3>
                <div className="space-y-3">
                  {a.byPair.length > 0 ? a.byPair.sort((x, y) => y.pnl - x.pnl).slice(0, 4).map((p) => (
                    <div key={p.pair} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs font-mono text-brand-text">{p.pair}</span>
                        <span className="text-[8px] sm:text-[9px] text-brand-silver">{p.trades} trades</span>
                      </div>
                      <span className={`text-sm sm:text-base font-mono font-bold ${p.pnl >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                        {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(0)}
                      </span>
                    </div>
                  )) : (
                    <p className="text-xs text-brand-silver">Log trades to see pair breakdown</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Tiltmeter + What-If */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={item}>
                <Tiltmeter recentTrades={trades} />
              </motion.div>
              <motion.div variants={item}>
                <WhatIfSimulator trades={trades} />
              </motion.div>
            </div>
          </>
        ) : (
          /* Empty State */
          <motion.div variants={item} className="glass-card p-12 sm:p-16 text-center">
            <BarChart3 className="w-16 h-16 text-brand-cyan/15 mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold text-brand-text mb-2">No Data Yet</h3>
            <p className="text-sm text-brand-silver max-w-md mx-auto">
              Your analytics engine is ready. Start logging trades in the Journal and watch this page transform into your personal performance dashboard.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}




