import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Rocket } from 'lucide-react'

export default function GrowthProjector() {
  const [balance, setBalance] = useState(10000)
  const [monthlyReturn, setMonthlyReturn] = useState(5)
  const [months, setMonths] = useState(12)

  const projections: Array<{ month: number; value: number }> = []
  let val = balance
  for (let i = 0; i <= months; i++) {
    projections.push({ month: i, value: val })
    val *= 1 + monthlyReturn / 100
  }

  const finalValue = projections[projections.length - 1].value
  const totalGain = finalValue - balance
  const totalPercent = ((finalValue - balance) / balance) * 100

  return (
    <div className="glass-card p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-profit/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-profit/10 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-brand-profit" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">Growth Projector</h3>
            <p className="text-[9px] sm:text-[10px] text-brand-silver">Compound your way to freedom</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Starting $</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-profit/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Monthly %</label>
            <input
              type="number"
              step="0.5"
              value={monthlyReturn}
              onChange={(e) => setMonthlyReturn(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-profit/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Months</label>
            <input
              type="number"
              value={months}
              onChange={(e) => setMonths(Math.min(Number(e.target.value), 60))}
              className="w-full px-3 py-2.5 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-profit/30 transition-colors"
            />
          </div>
        </div>

        {/* Milestone bars */}
        <div className="space-y-2 mb-4">
          {[3, 6, 12].filter(m => m <= months).map((m) => {
            const mVal = balance * Math.pow(1 + monthlyReturn / 100, m)
            const pct = ((mVal - balance) / balance) * 100
            return (
              <div key={m} className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-brand-silver w-8">{m}mo</span>
                <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((mVal / finalValue) * 100, 100)}%` }}
                    transition={{ duration: 0.8, delay: m * 0.1 }}
                    className="h-full rounded-lg bg-gradient-to-r from-brand-profit/40 to-brand-cyan/40 flex items-center justify-end pr-2"
                  >
                    <span className="text-[9px] font-mono font-bold text-brand-text">
                      ${mVal.toFixed(0)}
                    </span>
                  </motion.div>
                </div>
                <span className="text-[10px] font-mono text-brand-profit w-14 text-right">+{pct.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>

        {/* Final result */}
        <motion.div
          animate={{ scale: [1, 1.01, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="p-4 rounded-xl bg-gradient-to-br from-brand-profit/10 to-brand-cyan/5 border border-brand-profit/20 text-center"
        >
          <p className="text-[9px] uppercase tracking-wider text-brand-profit mb-1">Projected Balance at {months} Months</p>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-brand-profit">
            ${finalValue.toFixed(2)}
          </p>
          <p className="text-xs text-brand-cyan mt-1 font-mono">
            +${totalGain.toFixed(2)} ({totalPercent.toFixed(1)}%)
          </p>
        </motion.div>
      </div>
    </div>
  )
}
