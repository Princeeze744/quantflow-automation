import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Globe } from 'lucide-react'

const sessions = [
  {
    name: 'Sydney',
    emoji: '🇦🇺',
    startUTC: 21,
    endUTC: 6,
    color: 'brand-violet',
    pairs: 'AUD, NZD',
  },
  {
    name: 'Tokyo',
    emoji: '🇯🇵',
    startUTC: 0,
    endUTC: 9,
    color: 'brand-cyan',
    pairs: 'JPY, AUD',
  },
  {
    name: 'London',
    emoji: '🇬🇧',
    startUTC: 7,
    endUTC: 16,
    color: 'brand-profit',
    pairs: 'EUR, GBP, CHF',
  },
  {
    name: 'New York',
    emoji: '🇺🇸',
    startUTC: 13,
    endUTC: 22,
    color: 'brand-cyan',
    pairs: 'USD, CAD',
  },
]

const isActive = (start: number, end: number, currentHour: number) => {
  if (start < end) return currentHour >= start && currentHour < end
  return currentHour >= start || currentHour < end
}

export default function SessionClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const utcHour = now.getUTCHours()
  const utcMin = now.getUTCMinutes()
  const utcSec = now.getUTCSeconds()

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-brand-cyan" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">Session Clock</h3>
            <p className="text-[9px] sm:text-[10px] text-brand-silver">Know when to trade</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-space border border-white/10">
          <Clock className="w-3 h-3 text-brand-cyan" />
          <span className="text-xs font-mono font-bold text-brand-cyan">
            {String(utcHour).padStart(2, '0')}:{String(utcMin).padStart(2, '0')}:{String(utcSec).padStart(2, '0')} UTC
          </span>
        </div>
      </div>

      {/* Visual timeline */}
      <div className="mb-5 relative">
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full bg-brand-cyan/30 rounded-full"
            style={{ width: `${((utcHour * 60 + utcMin) / 1440) * 100}%` }}
          />
        </div>
        {/* Hour markers */}
        <div className="flex justify-between mt-1">
          {[0, 4, 8, 12, 16, 20].map((h) => (
            <span key={h} className="text-[7px] sm:text-[8px] font-mono text-brand-silver/40">{String(h).padStart(2, '0')}:00</span>
          ))}
        </div>
      </div>

      {/* Session Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {sessions.map((session, i) => {
          const active = isActive(session.startUTC, session.endUTC, utcHour)
          return (
            <motion.div
              key={session.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className={`p-3 sm:p-4 rounded-xl border transition-all ${
                active
                  ? `bg-${session.color}/10 border-${session.color}/20`
                  : 'bg-white/[0.02] border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">{session.emoji}</span>
                  <span className="text-xs sm:text-sm font-display font-semibold text-brand-text">{session.name}</span>
                </div>
                {active && (
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full bg-${session.color} animate-pulse`} />
                    <span className={`text-[8px] sm:text-[9px] font-mono font-bold text-${session.color}`}>LIVE</span>
                  </div>
                )}
              </div>
              <p className="text-[9px] sm:text-[10px] font-mono text-brand-silver">
                {String(session.startUTC).padStart(2, '0')}:00 — {String(session.endUTC).padStart(2, '0')}:00 UTC
              </p>
              <p className="text-[8px] sm:text-[9px] text-brand-silver/60 mt-1">{session.pairs}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Overlap indicator */}
      {isActive(13, 16, utcHour) && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-xl bg-gradient-to-r from-brand-profit/10 to-brand-cyan/10 border border-brand-profit/20 flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-brand-profit animate-pulse" />
          <p className="text-[10px] sm:text-xs text-brand-profit font-semibold">
            London-NY Overlap Active — Peak liquidity window!
          </p>
        </motion.div>
      )}
    </div>
  )
}
