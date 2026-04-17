import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Generate mock daily P&L for current month
const generateMonthData = () => {
  const days: Array<{ day: number; pnl: number }> = []
  for (let d = 1; d <= 30; d++) {
    const isWeekend = new Date(2026, 3, d).getDay() % 6 === 0
    if (isWeekend) {
      days.push({ day: d, pnl: 0 })
    } else {
      const pnl = (Math.random() - 0.4) * 600
      days.push({ day: d, pnl: Math.round(pnl * 100) / 100 })
    }
  }
  return days
}

const monthData = generateMonthData()

const getIntensity = (pnl: number) => {
  if (pnl === 0) return 'bg-white/[0.02] text-brand-silver/30'
  if (pnl > 400) return 'bg-brand-profit/30 text-brand-profit'
  if (pnl > 200) return 'bg-brand-profit/20 text-brand-profit'
  if (pnl > 0) return 'bg-brand-profit/10 text-brand-profit/80'
  if (pnl > -200) return 'bg-brand-loss/10 text-brand-loss/80'
  if (pnl > -400) return 'bg-brand-loss/20 text-brand-loss'
  return 'bg-brand-loss/30 text-brand-loss'
}

export default function PnlCalendar() {
  const totalPnl = monthData.reduce((sum, d) => sum + d.pnl, 0)
  const tradingDays = monthData.filter((d) => d.pnl !== 0)
  const greenDays = tradingDays.filter((d) => d.pnl > 0).length

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">P&L Calendar</h3>
          <p className="text-[9px] sm:text-[10px] text-brand-silver mt-0.5">
            {greenDays}/{tradingDays.length} green days ·
            <span className={totalPnl >= 0 ? ' text-brand-profit' : ' text-brand-loss'}>
              {' '}{totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(0)} MTD
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-brand-silver hover:text-brand-text transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-semibold text-brand-text">APR 2026</span>
          <button className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-brand-silver hover:text-brand-text transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center text-[8px] sm:text-[9px] font-mono text-brand-silver/50 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Offset for April 2026 starting on Wednesday */}
        {[null, null].map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {monthData.map((day, i) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.015 }}
            className={`aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center cursor-pointer hover:ring-1 hover:ring-brand-cyan/20 transition-all ${getIntensity(day.pnl)}`}
          >
            <span className="text-[9px] sm:text-[10px] font-mono opacity-60">{day.day}</span>
            {day.pnl !== 0 && (
              <span className="text-[7px] sm:text-[8px] font-mono font-bold">
                {day.pnl > 0 ? '+' : ''}{day.pnl.toFixed(0)}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
