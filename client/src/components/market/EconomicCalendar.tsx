import { motion } from 'framer-motion'
import { Calendar, AlertTriangle, Clock } from 'lucide-react'

const events = [
  { time: '08:30', currency: 'USD', event: 'Core CPI m/m', impact: 'high', actual: '0.3%', forecast: '0.2%', previous: '0.2%' },
  { time: '10:00', currency: 'USD', event: 'FOMC Meeting Minutes', impact: 'high', actual: '-', forecast: '-', previous: '-' },
  { time: '08:00', currency: 'EUR', event: 'ECB President Speaks', impact: 'high', actual: '-', forecast: '-', previous: '-' },
  { time: '04:30', currency: 'GBP', event: 'Employment Change', impact: 'medium', actual: '48K', forecast: '35K', previous: '32K' },
  { time: '19:45', currency: 'NZD', event: 'GDP q/q', impact: 'high', actual: '-', forecast: '0.4%', previous: '0.3%' },
  { time: '01:30', currency: 'AUD', event: 'RBA Rate Statement', impact: 'medium', actual: '-', forecast: '-', previous: '-' },
  { time: '08:30', currency: 'CAD', event: 'Retail Sales m/m', impact: 'medium', actual: '-', forecast: '0.5%', previous: '0.3%' },
]

const impactColors: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: 'bg-brand-loss/10', text: 'text-brand-loss', dot: 'bg-brand-loss' },
  medium: { bg: 'bg-yellow-400/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  low: { bg: 'bg-brand-profit/10', text: 'text-brand-profit', dot: 'bg-brand-profit' },
}

const flagMap: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  CHF: '🇨🇭', AUD: '🇦🇺', NZD: '🇳🇿', CAD: '🇨🇦',
}

export default function EconomicCalendar() {
  const highImpact = events.filter((e) => e.impact === 'high').length

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-brand-cyan" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">Economic Calendar</h3>
            <p className="text-[9px] sm:text-[10px] text-brand-silver">Today's market movers</p>
          </div>
        </div>
        {highImpact > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-loss/10 border border-brand-loss/20">
            <AlertTriangle className="w-3 h-3 text-brand-loss" />
            <span className="text-[9px] sm:text-[10px] font-semibold text-brand-loss">{highImpact} High Impact</span>
          </div>
        )}
      </div>

      {/* Scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[480px]">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 mb-1">
            <span className="col-span-2 text-[8px] sm:text-[9px] uppercase tracking-wider text-brand-silver/60">Time</span>
            <span className="col-span-3 text-[8px] sm:text-[9px] uppercase tracking-wider text-brand-silver/60">Event</span>
            <span className="col-span-2 text-[8px] sm:text-[9px] uppercase tracking-wider text-brand-silver/60 text-center">Impact</span>
            <span className="col-span-1 text-[8px] sm:text-[9px] uppercase tracking-wider text-brand-silver/60 text-right">Actual</span>
            <span className="col-span-2 text-[8px] sm:text-[9px] uppercase tracking-wider text-brand-silver/60 text-right">Forecast</span>
            <span className="col-span-2 text-[8px] sm:text-[9px] uppercase tracking-wider text-brand-silver/60 text-right">Previous</span>
          </div>

          {/* Events */}
          <div className="space-y-1">
            {events.map((event, i) => {
              const colors = impactColors[event.impact]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-12 gap-2 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors items-center"
                >
                  <div className="col-span-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-brand-silver/40" />
                    <span className="text-[10px] sm:text-xs font-mono text-brand-silver">{event.time}</span>
                  </div>
                  <div className="col-span-3 flex items-center gap-1.5">
                    <span className="text-xs">{flagMap[event.currency]}</span>
                    <span className="text-[10px] sm:text-xs text-brand-text font-medium truncate">{event.event}</span>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className={`text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${colors.bg} ${colors.text}`}>
                      {event.impact}
                    </span>
                  </div>
                  <span className={`col-span-1 text-[10px] sm:text-xs font-mono text-right font-semibold ${
                    event.actual === '-' ? 'text-brand-silver/40' : 'text-brand-text'
                  }`}>
                    {event.actual}
                  </span>
                  <span className="col-span-2 text-[10px] sm:text-xs font-mono text-right text-brand-silver">
                    {event.forecast}
                  </span>
                  <span className="col-span-2 text-[10px] sm:text-xs font-mono text-right text-brand-silver/60">
                    {event.previous}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
