import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

export default function EquityCurve() {
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

    // Generate equity curve data
    const points: number[] = [10000]
    for (let i = 1; i < 90; i++) {
      const change = (Math.random() - 0.42) * 200
      points.push(Math.max(points[i - 1] + change, 8000))
    }

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      const min = Math.min(...points) - 200
      const max = Math.max(...points) + 200
      const range = max - min

      const toX = (i: number) => (i / (points.length - 1)) * w
      const toY = (v: number) => h - ((v - min) / range) * h

      // Grid lines
      for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * h
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.04)'
        ctx.lineWidth = 0.5
        ctx.stroke()

        const val = max - (i / 4) * range
        ctx.fillStyle = 'rgba(160, 174, 192, 0.4)'
        ctx.font = '10px JetBrains Mono'
        ctx.fillText('$' + val.toFixed(0), 4, y - 4)
      }

      // Fill gradient under curve
      ctx.beginPath()
      ctx.moveTo(toX(0), toY(points[0]))
      points.forEach((p, i) => ctx.lineTo(toX(i), toY(p)))
      ctx.lineTo(toX(points.length - 1), h)
      ctx.lineTo(0, h)
      ctx.closePath()

      const gradient = ctx.createLinearGradient(0, 0, 0, h)
      gradient.addColorStop(0, 'rgba(0, 245, 255, 0.15)')
      gradient.addColorStop(0.5, 'rgba(124, 92, 252, 0.05)')
      gradient.addColorStop(1, 'rgba(0, 245, 255, 0)')
      ctx.fillStyle = gradient
      ctx.fill()

      // Main line
      ctx.beginPath()
      ctx.moveTo(toX(0), toY(points[0]))
      points.forEach((p, i) => ctx.lineTo(toX(i), toY(p)))
      ctx.strokeStyle = '#00F5FF'
      ctx.lineWidth = 2
      ctx.shadowBlur = 10
      ctx.shadowColor = 'rgba(0, 245, 255, 0.5)'
      ctx.stroke()
      ctx.shadowBlur = 0

      // End dot
      const lastX = toX(points.length - 1)
      const lastY = toY(points[points.length - 1])
      ctx.beginPath()
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#00F5FF'
      ctx.shadowBlur = 15
      ctx.shadowColor = '#00F5FF'
      ctx.fill()
      ctx.shadowBlur = 0

      // End value
      ctx.fillStyle = '#00F5FF'
      ctx.font = 'bold 12px JetBrains Mono'
      ctx.fillText('$' + points[points.length - 1].toFixed(0), lastX - 60, lastY - 12)
    }

    resize()
    draw()
    window.addEventListener('resize', () => { resize(); draw() })
    return () => window.removeEventListener('resize', () => { resize(); draw() })
  }, [])

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-cyan" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">Equity Curve</h3>
            <p className="text-[9px] sm:text-[10px] text-brand-silver">Last 90 trades</p>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2">
          {['30D', '60D', '90D', 'ALL'].map((tf) => (
            <button
              key={tf}
              className={`px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono font-medium transition-all ${
                tf === '90D'
                  ? 'bg-brand-cyan/15 text-brand-cyan'
                  : 'text-brand-silver hover:text-brand-text hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="h-48 sm:h-64 lg:h-72 rounded-xl overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  )
}
