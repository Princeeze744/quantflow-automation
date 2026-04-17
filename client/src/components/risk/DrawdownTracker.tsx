import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, ArrowDown } from 'lucide-react'

export default function DrawdownTracker() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx.scale(2, 2)
    }

    // Generate drawdown data
    const equity: number[] = [10000]
    for (let i = 1; i < 60; i++) {
      equity.push(equity[i - 1] + (Math.random() - 0.42) * 150)
    }

    let peak = equity[0]
    const drawdowns = equity.map((val) => {
      if (val > peak) peak = val
      return ((val - peak) / peak) * 100
    })

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      const minDD = Math.min(...drawdowns)
      const range = Math.abs(minDD) || 1

      const toX = (i: number) => (i / (drawdowns.length - 1)) * w
      const toY = (v: number) => (Math.abs(v) / range) * (h - 20) + 10

      // Zero line
      ctx.beginPath()
      ctx.moveTo(0, 10)
      ctx.lineTo(w, 10)
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.1)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Max DD line
      ctx.beginPath()
      ctx.setLineDash([4, 4])
      ctx.moveTo(0, toY(minDD))
      ctx.lineTo(w, toY(minDD))
      ctx.strokeStyle = 'rgba(255, 23, 68, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = 'rgba(255, 23, 68, 0.5)'
      ctx.font = '10px JetBrains Mono'
      ctx.fillText(`Max: ${minDD.toFixed(1)}%`, w - 80, toY(minDD) - 5)

      // Fill under drawdown
      ctx.beginPath()
      ctx.moveTo(toX(0), 10)
      drawdowns.forEach((d, i) => ctx.lineTo(toX(i), toY(d)))
      ctx.lineTo(toX(drawdowns.length - 1), 10)
      ctx.closePath()
      const gradient = ctx.createLinearGradient(0, 0, 0, h)
      gradient.addColorStop(0, 'rgba(255, 23, 68, 0.02)')
      gradient.addColorStop(1, 'rgba(255, 23, 68, 0.15)')
      ctx.fillStyle = gradient
      ctx.fill()

      // Line
      ctx.beginPath()
      ctx.moveTo(toX(0), 10)
      drawdowns.forEach((d, i) => ctx.lineTo(toX(i), toY(d)))
      ctx.strokeStyle = '#FF1744'
      ctx.lineWidth = 1.5
      ctx.shadowBlur = 8
      ctx.shadowColor = 'rgba(255, 23, 68, 0.4)'
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    resize()
    draw()
    window.addEventListener('resize', () => { resize(); draw() })
    return () => window.removeEventListener('resize', () => { resize(); draw() })
  }, [])

  const currentDD = -3.2
  const maxDD = -8.4
  const limit = -10

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-loss/10 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-brand-loss" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">Drawdown Tracker</h3>
            <p className="text-[9px] sm:text-[10px] text-brand-silver">Protect your capital at all costs</p>
          </div>
        </div>
      </div>

      {/* DD Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] text-center">
          <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-brand-silver">Current DD</p>
          <p className="text-base sm:text-lg font-mono font-bold text-yellow-400">{currentDD}%</p>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] text-center">
          <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-brand-silver">Max DD</p>
          <p className="text-base sm:text-lg font-mono font-bold text-brand-loss">{maxDD}%</p>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] text-center">
          <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-brand-silver">DD Limit</p>
          <p className="text-base sm:text-lg font-mono font-bold text-brand-text">{limit}%</p>
        </div>
      </div>

      {/* Drawdown bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[9px] text-brand-silver mb-1">
          <span>0%</span>
          <span>Limit: {limit}%</span>
        </div>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(Math.abs(currentDD) / Math.abs(limit)) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-brand-loss/60 to-brand-loss"
          />
          {/* Max DD marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-brand-loss"
            style={{ left: `${(Math.abs(maxDD) / Math.abs(limit)) * 100}%` }}
          />
        </div>
        <p className="text-[9px] text-brand-silver mt-1">
          Using <span className="text-yellow-400 font-mono">{((Math.abs(currentDD) / Math.abs(limit)) * 100).toFixed(0)}%</span> of drawdown allowance
        </p>
      </div>

      {/* Chart */}
      <div className="h-32 sm:h-40 rounded-xl overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  )
}
