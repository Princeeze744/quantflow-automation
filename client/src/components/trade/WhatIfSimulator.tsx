import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import type { Trade } from '../../stores/tradeStore'

interface Props {
  trades: Trade[]
}

export default function WhatIfSimulator({ trades }: Props) {
  const [scenario, setScenario] = useState<'held_to_tp' | 'tighter_sl' | 'no_revenge' | 'best_session'>('held_to_tp')

  const closedTrades = trades.filter((t) => t.status === 'CLOSED' && t.pnlDollars !== null)
  const actualPnl = closedTrades.reduce((s, t) => s + (t.pnlDollars || 0), 0)

  const simulated = useMemo(() => {
    if (closedTrades.length === 0) return { pnl: 0, trades: 0, diff: 0, description: '' }
    let simPnl = 0
    let simTrades = 0

    switch (scenario) {
      case 'held_to_tp': {
        closedTrades.forEach((t) => {
          if (t.takeProfit && t.entryPrice && t.stopLoss) {
            const slDist = Math.abs(t.entryPrice - t.stopLoss)
            const tpDist = Math.abs(t.takeProfit - t.entryPrice)
            const plannedRR = tpDist / (slDist || 1)
            if ((t.pnlDollars || 0) > 0) {
              const maxPnl = Math.abs(t.riskPercent || 1) * plannedRR * (t.lotSize || 0.1) * 100
              simPnl += Math.max(maxPnl, t.pnlDollars || 0)
            } else { simPnl += t.pnlDollars || 0 }
          } else { simPnl += t.pnlDollars || 0 }
          simTrades++
        })
        return { pnl: simPnl, trades: simTrades, diff: simPnl - actualPnl, description: 'If you held all winners to your planned Take Profit' }
      }
      case 'no_revenge': {
        closedTrades.forEach((t) => {
          if (!t.psychology?.revengeFlag) { simPnl += t.pnlDollars || 0; simTrades++ }
        })
        const removed = closedTrades.length - simTrades
        return { pnl: simPnl, trades: simTrades, diff: simPnl - actualPnl, description: `If you removed ${removed} revenge trade${removed !== 1 ? 's' : ''}` }
      }
      case 'tighter_sl': {
        closedTrades.forEach((t) => {
          if ((t.pnlDollars || 0) < 0) simPnl += (t.pnlDollars || 0) * 0.6
          else simPnl += t.pnlDollars || 0
          simTrades++
        })
        return { pnl: simPnl, trades: simTrades, diff: simPnl - actualPnl, description: 'If your losses were 40% smaller (tighter stops)' }
      }
      case 'best_session': {
        const sessionMap = new Map<string, number>()
        closedTrades.forEach((t) => {
          const s = t.session || 'UNKNOWN'
          sessionMap.set(s, (sessionMap.get(s) || 0) + (t.pnlDollars || 0))
        })
        let bestSession = ''
        let bestPnl = -Infinity
        sessionMap.forEach((pnl, session) => { if (pnl > bestPnl) { bestPnl = pnl; bestSession = session } })
        closedTrades.forEach((t) => {
          if (t.session === bestSession) { simPnl += t.pnlDollars || 0; simTrades++ }
        })
        return { pnl: simPnl, trades: simTrades, diff: simPnl - actualPnl, description: `If you only traded during ${bestSession} session` }
      }
    }
  }, [closedTrades, scenario, actualPnl])

  if (closedTrades.length < 3) {
    return (
      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-4 h-4 text-brand-violet" />
          <h3 className="text-xs sm:text-sm font-display font-semibold text-brand-text">What-If Simulator</h3>
        </div>
        <p className="text-xs text-brand-silver">Log at least 3 trades to unlock simulations.</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-violet/10 flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-brand-violet" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">What-If Simulator</h3>
          <p className="text-[9px] sm:text-[10px] text-brand-silver">See how rule changes would affect your results</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: 'held_to_tp', label: 'Held to TP' },
          { id: 'no_revenge', label: 'No Revenge' },
          { id: 'tighter_sl', label: 'Tighter SL' },
          { id: 'best_session', label: 'Best Session Only' },
        ].map((s) => (
          <button key={s.id} onClick={() => setScenario(s.id as any)} className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-colors border ${scenario === s.id ? 'bg-brand-violet/15 text-brand-violet border-brand-violet/30' : 'bg-white/5 text-brand-silver border-white/10'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <p className="text-[10px] sm:text-xs text-brand-silver mb-4 italic">{simulated.description}</p>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-white/[0.03] text-center">
          <p className="text-[8px] uppercase tracking-wider text-brand-silver mb-1">Actual P&L</p>
          <p className={`text-lg font-mono font-bold ${actualPnl >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>${actualPnl.toFixed(0)}</p>
          <p className="text-[9px] text-brand-silver">{closedTrades.length} trades</p>
        </div>
        <div className="p-3 rounded-xl flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-brand-violet" />
        </div>
        <div className="p-3 rounded-xl bg-brand-violet/5 border border-brand-violet/10 text-center">
          <p className="text-[8px] uppercase tracking-wider text-brand-violet mb-1">Simulated P&L</p>
          <p className={`text-lg font-mono font-bold ${simulated.pnl >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>${simulated.pnl.toFixed(0)}</p>
          <p className="text-[9px] text-brand-silver">{simulated.trades} trades</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={scenario} className={`mt-3 p-3 rounded-xl text-center ${simulated.diff >= 0 ? 'bg-brand-profit/5 border border-brand-profit/10' : 'bg-brand-loss/5 border border-brand-loss/10'}`}>
        <div className="flex items-center justify-center gap-2">
          {simulated.diff >= 0 ? <TrendingUp className="w-4 h-4 text-brand-profit" /> : <TrendingDown className="w-4 h-4 text-brand-loss" />}
          <span className={`text-sm font-mono font-bold ${simulated.diff >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>{simulated.diff >= 0 ? '+' : ''}${simulated.diff.toFixed(2)} difference</span>
        </div>
      </motion.div>
    </div>
  )
}
