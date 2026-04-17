import { motion } from 'framer-motion'
import { GitBranch } from 'lucide-react'

const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'NZD/USD']

// Mock correlation values (-1 to +1)
const correlations: number[][] = [
  [ 1.00,  0.87, -0.72, -0.93,  0.65,  0.58],
  [ 0.87,  1.00, -0.55, -0.81,  0.52,  0.44],
  [-0.72, -0.55,  1.00,  0.68, -0.48, -0.41],
  [-0.93, -0.81,  0.68,  1.00, -0.61, -0.53],
  [ 0.65,  0.52, -0.48, -0.61,  1.00,  0.89],
  [ 0.58,  0.44, -0.41, -0.53,  0.89,  1.00],
]

const getColor = (val: number) => {
  if (val >= 0.95) return 'bg-brand-cyan/40 text-brand-cyan'
  if (val >= 0.7) return 'bg-brand-profit/25 text-brand-profit'
  if (val >= 0.3) return 'bg-brand-profit/10 text-brand-profit/70'
  if (val >= -0.3) return 'bg-white/5 text-brand-silver'
  if (val >= -0.7) return 'bg-brand-loss/10 text-brand-loss/70'
  return 'bg-brand-loss/25 text-brand-loss'
}

export default function CorrelationMatrix() {
  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-violet/10 flex items-center justify-center">
          <GitBranch className="w-4 h-4 text-brand-violet" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">Correlation Matrix</h3>
          <p className="text-[9px] sm:text-[10px] text-brand-silver">Avoid doubling your risk on correlated pairs</p>
        </div>
      </div>

      {/* Scrollable */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[400px]">
          {/* Header Row */}
          <div className="flex mb-1">
            <div className="w-16 sm:w-20" />
            {pairs.map((p) => (
              <div key={p} className="flex-1 text-center">
                <span className="text-[7px] sm:text-[8px] font-mono text-brand-silver/60">{p.replace('/', '')}</span>
              </div>
            ))}
          </div>

          {/* Matrix */}
          {correlations.map((row, rowIdx) => (
            <div key={pairs[rowIdx]} className="flex items-center mb-1">
              <div className="w-16 sm:w-20 pr-1">
                <span className="text-[8px] sm:text-[9px] font-mono text-brand-silver">{pairs[rowIdx]}</span>
              </div>
              {row.map((val, colIdx) => (
                <motion.div
                  key={colIdx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: rowIdx * 0.04 + colIdx * 0.03 }}
                  className={`flex-1 mx-0.5 aspect-square rounded-md sm:rounded-lg flex items-center justify-center cursor-pointer hover:ring-1 hover:ring-brand-cyan/30 transition-all ${getColor(val)}`}
                  title={`${pairs[rowIdx]} / ${pairs[colIdx]}: ${val.toFixed(2)}`}
                >
                  <span className="text-[7px] sm:text-[9px] font-mono font-bold">
                    {rowIdx === colIdx ? '—' : val.toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4">
            <span className="text-[8px] sm:text-[9px] text-brand-silver">Strong −</span>
            {['bg-brand-loss/25', 'bg-brand-loss/10', 'bg-white/5', 'bg-brand-profit/10', 'bg-brand-profit/25'].map((c, i) => (
              <div key={i} className={`w-4 h-3 sm:w-5 sm:h-4 rounded ${c}`} />
            ))}
            <span className="text-[8px] sm:text-[9px] text-brand-silver">Strong +</span>
          </div>
        </div>
      </div>
    </div>
  )
}
