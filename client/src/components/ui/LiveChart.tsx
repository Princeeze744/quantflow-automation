import { useEffect, useRef } from 'react'

export default function LiveChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx.scale(2, 2)
    }

    const candles: Array<{ o: number; h: number; l: number; c: number; x: number }> = []

    const generateCandle = (basePrice: number) => {
      const change = (Math.random() - 0.48) * 8
      const o = basePrice
      const c = o + change
      const h = Math.max(o, c) + Math.random() * 4
      const l = Math.min(o, c) - Math.random() * 4
      return { o, h, l, c, x: 0 }
    }

    // Pre-generate candles
    let price = 150
    for (let i = 0; i < 60; i++) {
      const candle = generateCandle(price)
      candle.x = i * 14
      candles.push(candle)
      price = candle.c
    }

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      // Find price range
      let minP = Infinity, maxP = -Infinity
      candles.forEach(c => {
        if (c.l < minP) minP = c.l
        if (c.h > maxP) maxP = c.h
      })
      const range = maxP - minP || 1
      const padding = 20

      const toY = (price: number) => {
        return padding + ((maxP - price) / range) * (h - padding * 2)
      }

      // Draw horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const y = padding + (i / 4) * (h - padding * 2)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.04)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Draw EMA line
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(124, 92, 252, 0.6)'
      ctx.lineWidth = 1.5
      let ema = candles[0].c
      candles.forEach((candle, i) => {
        ema = ema * 0.9 + candle.c * 0.1
        const x = candle.x - time * 0.3 + w - 100
        const y = toY(ema)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Draw candles
      candles.forEach((candle) => {
        const x = candle.x - time * 0.3 + w - 100
        if (x < -20 || x > w + 20) return

        const bullish = candle.c >= candle.o
        const color = bullish ? '#00E676' : '#FF1744'
        const shadowColor = bullish ? 'rgba(0,230,118,0.3)' : 'rgba(255,23,68,0.3)'

        // Wick
        ctx.beginPath()
        ctx.moveTo(x, toY(candle.h))
        ctx.lineTo(x, toY(candle.l))
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.stroke()

        // Body
        const bodyTop = toY(Math.max(candle.o, candle.c))
        const bodyBottom = toY(Math.min(candle.o, candle.c))
        const bodyHeight = Math.max(bodyBottom - bodyTop, 1)

        ctx.fillStyle = color
        ctx.shadowBlur = 8
        ctx.shadowColor = shadowColor
        ctx.fillRect(x - 4, bodyTop, 8, bodyHeight)
        ctx.shadowBlur = 0
      })

      // Live price line
      const lastCandle = candles[candles.length - 1]
      const lastY = toY(lastCandle.c)
      ctx.beginPath()
      ctx.setLineDash([4, 4])
      ctx.moveTo(0, lastY)
      ctx.lineTo(w, lastY)
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.setLineDash([])

      // Price label
      ctx.fillStyle = '#00F5FF'
      ctx.font = '11px JetBrains Mono'
      ctx.fillText(lastCandle.c.toFixed(2), w - 60, lastY - 6)

      // Glow at chart edge
      const gradient = ctx.createLinearGradient(w - 120, 0, w, 0)
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(1, 'rgba(0, 245, 255, 0.02)')
      ctx.fillStyle = gradient
      ctx.fillRect(w - 120, 0, 120, h)

      time += 0.15

      // Add new candle periodically
      if (time % 50 < 0.2) {
        const last = candles[candles.length - 1]
        const newCandle = generateCandle(last.c)
        newCandle.x = last.x + 14
        candles.push(newCandle)
        if (candles.length > 80) candles.shift()
      }

      animationId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Live indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-space/80 border border-white/10">
        <div className="pulse-dot" />
        <span className="text-[11px] font-mono text-brand-cyan">LIVE</span>
      </div>
    </div>
  )
}
