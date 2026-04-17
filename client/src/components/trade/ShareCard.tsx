import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Download, X, TrendingUp, TrendingDown, Copy, Check } from 'lucide-react'
import type { Trade } from '../../stores/tradeStore'

interface Props {
  trade: Trade
  open: boolean
  onClose: () => void
}

export default function ShareCard({ trade, open, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const isWin = (trade.pnlDollars || 0) >= 0
  const holdMins = trade.holdDurationMin || 0
  const holdTime = holdMins < 60 ? `${holdMins}m` : `${Math.floor(holdMins / 60)}h ${holdMins % 60}m`

  const handleCopy = async () => {
    const text = `${isWin ? '✅' : '❌'} ${trade.pair} ${trade.direction}
P&L: ${isWin ? '+' : ''}$${(trade.pnlDollars || 0).toFixed(2)}
R:R: ${(trade.rrActual || 0).toFixed(2)}R
Pips: ${(trade.pnlPips || 0) >= 0 ? '+' : ''}${(trade.pnlPips || 0).toFixed(0)}
Session: ${trade.session || '-'}
Hold: ${holdTime}

Tracked with Quantflow Automation
Powered by Trade2Retire Academy`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w = 600
      const h = 400
      canvas.width = w
      canvas.height = h

      // Background
      const bg = ctx.createLinearGradient(0, 0, w, h)
      bg.addColorStop(0, '#0B0F1E')
      bg.addColorStop(1, '#141929')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Border glow
      ctx.strokeStyle = isWin ? 'rgba(0,230,118,0.3)' : 'rgba(255,23,68,0.3)'
      ctx.lineWidth = 2
      ctx.roundRect(10, 10, w - 20, h - 20, 16)
      ctx.stroke()

      // Header
      ctx.fillStyle = '#E8ECF4'
      ctx.font = 'bold 28px Inter, sans-serif'
      ctx.fillText(`${trade.pair}`, 40, 60)

      ctx.fillStyle = isWin ? '#00E676' : '#FF1744'
      ctx.font = 'bold 18px Inter, sans-serif'
      ctx.fillText(trade.direction, 40, 90)

      // P&L
      ctx.fillStyle = isWin ? '#00E676' : '#FF1744'
      ctx.font = 'bold 48px JetBrains Mono, monospace'
      ctx.fillText(`${isWin ? '+' : ''}$${(trade.pnlDollars || 0).toFixed(2)}`, 40, 160)

      // Stats
      ctx.fillStyle = '#A0AEC0'
      ctx.font = '14px Inter, sans-serif'
      const stats = [
        `R:R: ${(trade.rrActual || 0).toFixed(2)}R`,
        `Pips: ${(trade.pnlPips || 0) >= 0 ? '+' : ''}${(trade.pnlPips || 0).toFixed(0)}`,
        `Session: ${trade.session || '-'}`,
        `Hold Time: ${holdTime}`,
      ]
      stats.forEach((s, i) => {
        ctx.fillText(s, 40, 210 + i * 28)
      })

      // Grade
      if (trade.psychology?.grade) {
        ctx.fillStyle = isWin ? '#00E676' : '#FF1744'
        ctx.font = 'bold 36px Inter, sans-serif'
        ctx.fillText(trade.psychology.grade, w - 80, 70)
      }

      // Branding
      ctx.fillStyle = '#7C5CFC'
      ctx.font = 'bold 14px Inter, sans-serif'
      ctx.fillText('QUANTFLOW AUTOMATION', 40, h - 50)
      ctx.fillStyle = '#A0AEC0'
      ctx.font = '11px Inter, sans-serif'
      ctx.fillText('Powered by Trade2Retire Academy', 40, h - 30)

      // Cyan accent line
      ctx.fillStyle = '#00F5FF'
      ctx.fillRect(40, 170, 120, 3)

      const link = document.createElement('a')
      link.download = `quantflow-${trade.pair.replace('/', '')}-${isWin ? 'WIN' : 'LOSS'}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">

          {/* Preview Card */}
          <div ref={cardRef} className={`p-6 sm:p-8 rounded-2xl border-2 ${isWin ? 'border-brand-profit/30 bg-gradient-to-br from-brand-obsidian to-brand-space' : 'border-brand-loss/30 bg-gradient-to-br from-brand-obsidian to-brand-space'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isWin ? 'bg-brand-profit/15' : 'bg-brand-loss/15'}`}>
                  {isWin ? <TrendingUp className="w-6 h-6 text-brand-profit" /> : <TrendingDown className="w-6 h-6 text-brand-loss" />}
                </div>
                <div>
                  <h2 className="text-xl font-mono font-bold text-brand-text">{trade.pair}</h2>
                  <span className={`text-xs font-semibold ${isWin ? 'text-brand-profit' : 'text-brand-loss'}`}>{trade.direction}</span>
                </div>
              </div>
              {trade.psychology?.grade && (
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${isWin ? 'bg-brand-profit/15 text-brand-profit' : 'bg-brand-loss/15 text-brand-loss'}`}>
                  {trade.psychology.grade}
                </div>
              )}
            </div>

            {/* P&L */}
            <div className="mb-5">
              <p className={`text-4xl font-mono font-bold ${isWin ? 'text-brand-profit' : 'text-brand-loss'}`}>
                {isWin ? '+' : ''}${(trade.pnlDollars || 0).toFixed(2)}
              </p>
              <div className={`h-0.5 w-24 mt-2 rounded-full ${isWin ? 'bg-brand-profit' : 'bg-brand-loss'}`} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: 'R:R', value: `${(trade.rrActual || 0).toFixed(2)}R` },
                { label: 'Pips', value: `${(trade.pnlPips || 0) >= 0 ? '+' : ''}${(trade.pnlPips || 0).toFixed(0)}` },
                { label: 'Session', value: trade.session || '-' },
                { label: 'Hold', value: holdTime },
              ].map((s) => (
                <div key={s.label} className="text-center p-2 rounded-lg bg-white/[0.03]">
                  <p className="text-[8px] uppercase tracking-wider text-brand-silver">{s.label}</p>
                  <p className="text-sm font-mono font-bold text-brand-text mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Branding */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <p className="text-xs font-bold text-brand-violet">QUANTFLOW AUTOMATION</p>
                <p className="text-[9px] text-brand-silver">Powered by Trade2Retire Academy</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-violet flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-brand-space" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet text-sm font-semibold text-brand-space">
              <Download className="w-4 h-4" /> Download Image
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-sm font-semibold text-brand-text">
              {copied ? <><Check className="w-4 h-4 text-brand-profit" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Text</>}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
              className="w-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-silver hover:text-brand-text">
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
