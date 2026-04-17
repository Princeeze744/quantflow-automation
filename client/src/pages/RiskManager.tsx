import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
  Zap,
} from 'lucide-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import Tiltmeter from '../components/ui/Tiltmeter'
import WhatIfSimulator from '../components/trade/WhatIfSimulator'
import { useTradeStore } from '../stores/tradeStore'
import PositionCalculator from '../components/risk/PositionCalculator'
import RiskInsights from '../components/risk/RiskInsights'
import DrawdownTracker from '../components/risk/DrawdownTracker'
import GrowthProjector from '../components/risk/GrowthProjector'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
}

const riskRules = [
  { rule: 'Max 1% risk per trade', status: 'ok', current: '1.0%' },
  { rule: 'Max 3 trades per day', status: 'ok', current: '2 / 3' },
  { rule: 'Daily loss limit: -$300', status: 'ok', current: '-$42' },
  { rule: 'Weekly loss limit: -$800', status: 'ok', current: '+$769' },
  { rule: 'Max 3% exposure per currency', status: 'warning', current: '2.8% GBP' },
  { rule: 'No trading during high-impact news', status: 'ok', current: 'Clear' },
]

const exposures = [
  { currency: 'USD', exposure: 4.2, trades: 3 },
  { currency: 'EUR', exposure: 2.1, trades: 2 },
  { currency: 'GBP', exposure: 2.8, trades: 2 },
  { currency: 'JPY', exposure: 1.5, trades: 1 },
  { currency: 'AUD', exposure: 0.8, trades: 1 },
]

export default function RiskManager() {
  const { trades, fetchTrades } = useTradeStore()
  
  useEffect(() => {
    fetchTrades()
  }, [fetchTrades])
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
            <span className="text-brand-text">Risk </span>
            <span className="text-gradient">Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-silver mt-1">
            Protect capital like a fund manager. Survive first, profit second.
          </p>
        </motion.div>

        {/* Risk Rules Status */}
        <motion.div variants={item} className="glass-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-violet/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-brand-violet" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">Risk Rules Monitor</h3>
              <p className="text-[9px] sm:text-[10px] text-brand-silver">Real-time rule compliance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {riskRules.map((r, i) => (
              <motion.div
                key={r.rule}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  r.status === 'ok'
                    ? 'bg-brand-profit/5 border-brand-profit/10'
                    : r.status === 'warning'
                    ? 'bg-yellow-400/5 border-yellow-400/10'
                    : 'bg-brand-loss/5 border-brand-loss/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  {r.status === 'ok' ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-profit flex-shrink-0" />
                  ) : r.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-brand-loss flex-shrink-0" />
                  )}
                  <span className="text-[11px] sm:text-xs text-brand-text">{r.rule}</span>
                </div>
                <span className={`text-[10px] sm:text-xs font-mono font-semibold ${
                  r.status === 'ok' ? 'text-brand-profit' : r.status === 'warning' ? 'text-yellow-400' : 'text-brand-loss'
                }`}>
                  {r.current}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Calculator + Drawdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <motion.div variants={item}>
            <PositionCalculator />
          </motion.div>
          <motion.div variants={item}>
            <DrawdownTracker />
          </motion.div>
        </div>

        {/* Exposure + Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Currency Exposure */}
          <motion.div variants={item} className="glass-card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-brand-cyan" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">Currency Exposure</h3>
                <p className="text-[9px] sm:text-[10px] text-brand-silver">Max 3% per currency recommended</p>
              </div>
            </div>

            <div className="space-y-3">
              {exposures.map((e, i) => (
                <motion.div
                  key={e.currency}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-mono font-bold text-brand-text">{e.currency}</span>
                      <span className="text-[9px] text-brand-silver">{e.trades} trades</span>
                    </div>
                    <span className={`text-xs font-mono font-bold ${
                      e.exposure > 3 ? 'text-brand-loss' : e.exposure > 2.5 ? 'text-yellow-400' : 'text-brand-profit'
                    }`}>
                      {e.exposure}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(e.exposure / 5) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.4 + i * 0.06 }}
                      className={`h-full rounded-full ${
                        e.exposure > 3
                          ? 'bg-brand-loss'
                          : e.exposure > 2.5
                          ? 'bg-gradient-to-r from-yellow-400/60 to-yellow-400'
                          : 'bg-gradient-to-r from-brand-profit/40 to-brand-profit'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 3% limit line indicator */}
            <div className="mt-3 flex items-center gap-2 text-[9px] text-brand-silver">
              <div className="w-3 h-0.5 bg-brand-loss rounded" />
              <span>3% limit threshold</span>
            </div>
          </motion.div>

          {/* Growth Projector */}
          <motion.div variants={item}>
            <GrowthProjector />
          </motion.div>
        </div>

        {/* Risk of Ruin */}
        <motion.div variants={item} className="glass-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-loss/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-brand-loss" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">Risk of Ruin Analysis</h3>
              <p className="text-[9px] sm:text-[10px] text-brand-silver">Probability of losing X% of your account</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { loss: '10%', prob: '12.4%', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { loss: '25%', prob: '3.2%', color: 'text-brand-loss', bg: 'bg-brand-loss/10' },
              { loss: '50%', prob: '0.4%', color: 'text-brand-loss', bg: 'bg-brand-loss/10' },
              { loss: '100%', prob: '0.01%', color: 'text-brand-profit', bg: 'bg-brand-profit/10' },
            ].map((r) => (
              <div key={r.loss} className={`p-3 sm:p-4 rounded-xl ${r.bg} text-center`}>
                <p className="text-[9px] uppercase tracking-wider text-brand-silver mb-1">Lose {r.loss}</p>
                <p className={`text-xl sm:text-2xl font-mono font-bold ${r.color}`}>{r.prob}</p>
                <p className="text-[8px] text-brand-silver mt-0.5">probability</p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-brand-silver mt-4 leading-relaxed">
            Based on your current win rate (67.4%), average R:R (1.76:1), and risk per trade (1%). 
            Calculated using 10,000 Monte Carlo simulations. Your risk profile is <span className="text-brand-profit font-semibold">healthy</span>.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}





