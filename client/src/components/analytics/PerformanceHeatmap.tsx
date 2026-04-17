import { motion } from 'framer-motion'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const hours = ['02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']

// Mock performance data: -3 to +3 scale
const generateData = () => {
  return days.map(() =>
    hours.map(() => {
      const r = Math.random()
      if (r < 0.15) return -2
      if (r < 0.25) return -1
      if (r < 0.4) return 0
      if (r < 0.6) return 1
      if (r < 0.8) return 2
      return 3
    })
  )
}

const data = generateData()

const getColor = (val: number) => {
  if (val <= -2) return 'bg-brand-loss/60'
  if (val === -1) return 'bg-brand-loss/30'
  if (val === 0) return 'bg-white/5'
  if (val === 1) return 'bg-brand-profit/20'
  if (val === 2) return 'bg-brand-profit/40'
  return 'bg-brand-profit/70'
}

export default function PerformanceHeatmap() {
  return (
    <div className="glass-card p-4 sm:p-6">
      <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text mb-4">
        Performance Heatmap
      </h3>
      <p className="text-[10px] sm:text-xs text-brand-silver mb-4">Win rate by day &amp; hour — find your edge windows</p>

      {/* Scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[500px]">
          {/* Hour labels */}
          <div className="flex mb-1 ml-10">
            {hours.map((h) => (
              <div key={h} className="flex-1 text-center text-[8px] sm:text-[9px] font-mono text-brand-silver/60">
                {h}
              </div>
            ))}
          </div>

          {/* Grid */}
          {data.map((row, dayIdx) => (
            <div key={days[dayIdx]} className="flex items-center gap-1 mb-1">
              <span className="w-9 text-[10px] sm:text-xs font-mono text-brand-silver text-right pr-1">
                {days[dayIdx]}
              </span>
              <div className="flex-1 flex gap-0.5 sm:gap-1">
                {row.map((val, hourIdx) => (
                  <motion.div
                    key={hourIdx}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: dayIdx * 0.05 + hourIdx * 0.02 }}
                    className={`flex-1 h-7 sm:h-9 rounded-md sm:rounded-lg ${getColor(val)} hover:ring-1 hover:ring-brand-cyan/30 transition-all cursor-pointer`}
                    title={`${days[dayIdx]} ${hours[hourIdx]}: ${val > 0 ? '+' : ''}${val}R`}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-[9px] text-brand-silver">Loss</span>
            {['bg-brand-loss/60', 'bg-brand-loss/30', 'bg-white/5', 'bg-brand-profit/20', 'bg-brand-profit/40', 'bg-brand-profit/70'].map((c, i) => (
              <div key={i} className={`w-5 h-3 sm:w-6 sm:h-4 rounded ${c}`} />
            ))}
            <span className="text-[9px] text-brand-silver">Profit</span>
          </div>
        </div>
      </div>
    </div>
  )
}
