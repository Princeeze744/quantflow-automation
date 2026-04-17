import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

const currencies = [
  { code: 'USD', strength: 78, change: +3.2, flag: '🇺🇸' },
  { code: 'EUR', strength: 45, change: -2.1, flag: '🇪🇺' },
  { code: 'GBP', strength: 62, change: +1.4, flag: '🇬🇧' },
  { code: 'JPY', strength: 38, change: -4.5, flag: '🇯🇵' },
  { code: 'CHF', strength: 55, change: +0.8, flag: '🇨🇭' },
  { code: 'AUD', strength: 42, change: -1.9, flag: '🇦🇺' },
  { code: 'NZD', strength: 35, change: -2.8, flag: '🇳🇿' },
  { code: 'CAD', strength: 58, change: +1.1, flag: '🇨🇦' },
]

const getBarColor = (strength: number) => {
  if (strength >= 70) return 'from-brand-profit/60 to-brand-profit'
  if (strength >= 50) return 'from-brand-cyan/40 to-brand-cyan/70'
  if (strength >= 40) return 'from-yellow-400/40 to-yellow-400/70'
  return 'from-brand-loss/40 to-brand-loss/70'
}

const getTextColor = (strength: number) => {
  if (strength >= 70) return 'text-brand-profit'
  if (strength >= 50) return 'text-brand-cyan'
  if (strength >= 40) return 'text-yellow-400'
  return 'text-brand-loss'
}

export default function CurrencyStrength() {
  const sorted = [...currencies].sort((a, b) => b.strength - a.strength)

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-violet/10 flex items-center justify-center">
          <Zap className="w-4 h-4 text-brand-violet" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">Currency Strength</h3>
          <p className="text-[9px] sm:text-[10px] text-brand-silver">Buy strong, sell weak</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {sorted.map((c, i) => (
          <motion.div
            key={c.code}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-sm sm:text-base">{c.flag}</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-brand-text w-8">{c.code}</span>
              <div className="flex-1 h-5 sm:h-6 rounded-lg bg-white/5 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${c.strength}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                  className={`h-full rounded-lg bg-gradient-to-r ${getBarColor(c.strength)} flex items-center justify-end pr-2`}
                >
                  <span className="text-[8px] sm:text-[9px] font-mono font-bold text-white/90">
                    {c.strength}
                  </span>
                </motion.div>
              </div>
              <span className={`text-[10px] sm:text-xs font-mono w-10 text-right ${
                c.change >= 0 ? 'text-brand-profit' : 'text-brand-loss'
              }`}>
                {c.change >= 0 ? '+' : ''}{c.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-brand-space/50 border border-white/5">
        <p className="text-[10px] sm:text-xs text-brand-silver leading-relaxed">
          <span className="text-brand-profit font-semibold">Signal:</span> USD strongest, JPY/NZD weakest. 
          Consider USD/JPY longs or NZD/USD shorts for maximum divergence.
        </p>
      </div>
    </div>
  )
}
