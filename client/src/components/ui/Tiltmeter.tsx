import { motion } from 'framer-motion'
import { Brain, AlertTriangle, CheckCircle2, Flame } from 'lucide-react'

interface Props {
  recentTrades: Array<{
    pnlDollars: number | null
    psychology: { preMood: number; revengeFlag: boolean; fomoFlag: boolean } | null
  }>
}

export default function Tiltmeter({ recentTrades }: Props) {
  const last10 = recentTrades.slice(0, 10)

  if (last10.length === 0) {
    return (
      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-brand-violet" />
          <h3 className="text-xs sm:text-sm font-display font-semibold text-brand-text">Tiltmeter</h3>
        </div>
        <p className="text-xs text-brand-silver">Log trades to track your emotional state.</p>
      </div>
    )
  }

  let tiltScore = 0

  let consecutiveLosses = 0
  for (const t of last10) {
    if ((t.pnlDollars || 0) < 0) consecutiveLosses++
    else break
  }
  tiltScore += consecutiveLosses * 15

  const revengeCount = last10.filter((t) => t.psychology?.revengeFlag).length
  tiltScore += revengeCount * 20

  const fomoCount = last10.filter((t) => t.psychology?.fomoFlag).length
  tiltScore += fomoCount * 10

  const avgMood = last10.reduce((s, t) => s + (t.psychology?.preMood || 3), 0) / last10.length
  if (avgMood < 2.5) tiltScore += 20
  else if (avgMood < 3) tiltScore += 10

  tiltScore = Math.min(tiltScore, 100)

  const getStatus = () => {
    if (tiltScore <= 20) return { label: 'FOCUSED', color: 'text-brand-profit', bg: 'bg-brand-profit', icon: CheckCircle2, advice: 'You are in a great mental state. Trade with confidence.' }
    if (tiltScore <= 45) return { label: 'NEUTRAL', color: 'text-brand-cyan', bg: 'bg-brand-cyan', icon: Brain, advice: 'Slight emotional pressure detected. Stay disciplined.' }
    if (tiltScore <= 70) return { label: 'TILTING', color: 'text-yellow-400', bg: 'bg-yellow-400', icon: AlertTriangle, advice: 'Warning: You may be emotionally compromised. Consider a break.' }
    return { label: 'ON TILT', color: 'text-brand-loss', bg: 'bg-brand-loss', icon: Flame, advice: 'STOP TRADING. You are on full tilt. Walk away and reset.' }
  }

  const status = getStatus()

  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-brand-violet" />
          <h3 className="text-xs sm:text-sm font-display font-semibold text-brand-text">Tiltmeter</h3>
        </div>
        <span className={`text-[9px] sm:text-[10px] font-mono font-bold ${status.color}`}>{status.label}</span>
      </div>

      <div className="relative h-3 rounded-full bg-white/5 overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${tiltScore}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            tiltScore <= 20 ? 'bg-brand-profit' : tiltScore <= 45 ? 'bg-brand-cyan' : tiltScore <= 70 ? 'bg-yellow-400' : 'bg-brand-loss'
          }`}
        />
        <div className="absolute top-0 left-[20%] w-px h-full bg-white/10" />
        <div className="absolute top-0 left-[45%] w-px h-full bg-white/10" />
        <div className="absolute top-0 left-[70%] w-px h-full bg-white/10" />
      </div>

      <div className="flex justify-between text-[7px] sm:text-[8px] text-brand-silver/40 mb-3">
        <span>Focused</span><span>Neutral</span><span>Tilting</span><span>On Tilt</span>
      </div>

      <div className={`p-3 rounded-xl ${
        tiltScore <= 20 ? 'bg-brand-profit/5 border border-brand-profit/10' :
        tiltScore <= 45 ? 'bg-brand-cyan/5 border border-brand-cyan/10' :
        tiltScore <= 70 ? 'bg-yellow-400/5 border border-yellow-400/10' : 'bg-brand-loss/5 border border-brand-loss/10'
      }`}>
        <div className="flex items-start gap-2">
          <status.icon className={`w-4 h-4 ${status.color} flex-shrink-0 mt-0.5`} />
          <p className={`text-[10px] sm:text-xs ${status.color} leading-relaxed`}>{status.advice}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-white/[0.02]">
          <p className="text-[8px] text-brand-silver">Consec. Losses</p>
          <p className={`text-sm font-mono font-bold ${consecutiveLosses > 2 ? 'text-brand-loss' : 'text-brand-text'}`}>{consecutiveLosses}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.02]">
          <p className="text-[8px] text-brand-silver">Revenge Trades</p>
          <p className={`text-sm font-mono font-bold ${revengeCount > 0 ? 'text-brand-loss' : 'text-brand-text'}`}>{revengeCount}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.02]">
          <p className="text-[8px] text-brand-silver">Avg Mood</p>
          <p className={`text-sm font-mono font-bold ${avgMood < 3 ? 'text-yellow-400' : 'text-brand-profit'}`}>{avgMood.toFixed(1)}</p>
        </div>
      </div>
    </div>
  )
}
