import { motion } from 'framer-motion'

const pairs = [
  { pair: 'EUR/USD', trades: 28, winRate: 71.4, pnl: 1842.5, avgRR: 1.8, best: true },
  { pair: 'GBP/JPY', trades: 15, winRate: 53.3, pnl: -234.0, avgRR: 0.9, best: false },
  { pair: 'USD/CHF', trades: 12, winRate: 66.7, pnl: 967.0, avgRR: 2.1, best: false },
  { pair: 'AUD/USD', trades: 18, winRate: 61.1, pnl: 445.0, avgRR: 1.4, best: false },
  { pair: 'XAU/USD', trades: 8, winRate: 75.0, pnl: 1230.0, avgRR: 2.4, best: false },
  { pair: 'USD/JPY', trades: 10, winRate: 50.0, pnl: -89.0, avgRR: 1.0, best: false },
]

export default function PairBreakdown() {
  const maxTrades = Math.max(...pairs.map((p) => p.trades))

  return (
    <div className="glass-card p-4 sm:p-6">
      <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text mb-1">
        Pair Performance
      </h3>
      <p className="text-[10px] sm:text-xs text-brand-silver mb-4">Know where your edge lives</p>

      <div className="space-y-3">
        {pairs.map((p, i) => (
          <motion.div
            key={p.pair}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-mono font-bold text-brand-text">{p.pair}</span>
                {p.winRate >= 70 && (
                  <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-brand-profit/10 text-brand-profit border border-brand-profit/20">
                    HOT
                  </span>
                )}
                {p.winRate < 55 && (
                  <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-brand-loss/10 text-brand-loss border border-brand-loss/20">
                    REVIEW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-right">
                <div className="hidden sm:block">
                  <p className="text-[9px] text-brand-silver">Trades</p>
                  <p className="text-xs font-mono font-semibold text-brand-text">{p.trades}</p>
                </div>
                <div>
                  <p className="text-[9px] text-brand-silver">Win Rate</p>
                  <p className={`text-xs font-mono font-semibold ${p.winRate >= 60 ? 'text-brand-profit' : p.winRate >= 50 ? 'text-yellow-400' : 'text-brand-loss'}`}>
                    {p.winRate}%
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-brand-silver">P&L</p>
                  <p className={`text-xs font-mono font-bold ${p.pnl >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                    {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bar */}
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(p.trades / maxTrades) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.07, duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  p.pnl >= 0
                    ? 'bg-gradient-to-r from-brand-profit/60 to-brand-cyan/60'
                    : 'bg-gradient-to-r from-brand-loss/60 to-brand-loss/30'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
