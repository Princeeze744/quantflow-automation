import { useEffect, useRef } from 'react'
import { createChart, ColorType } from 'lightweight-charts'

interface Props {
  pair: string
  entryPrice: number
  exitPrice?: number | null
  stopLoss?: number | null
  takeProfit?: number | null
  direction: string
  entryTime: string
  exitTime?: string | null
}

export default function TradeChart({ pair, entryPrice, exitPrice, stopLoss, takeProfit, direction, entryTime }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#A0AEC0',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(0, 245, 255, 0.03)' },
        horzLines: { color: 'rgba(0, 245, 255, 0.03)' },
      },
      width: containerRef.current.clientWidth,
      height: 220,
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.05)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.05)', timeVisible: true },
      crosshair: {
        vertLine: { color: 'rgba(0,245,255,0.2)' },
        horzLine: { color: 'rgba(0,245,255,0.2)' },
      },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00E676',
      downColor: '#FF1744',
      borderUpColor: '#00E676',
      borderDownColor: '#FF1744',
      wickUpColor: '#00E676',
      wickDownColor: '#FF1744',
    })

    const baseTime = new Date(entryTime).getTime() / 1000
    const priceBase = entryPrice
    const volatility = priceBase * 0.001
    const candles = []
    let lastClose = priceBase - volatility * 5

    for (let i = -40; i < 30; i++) {
      const time = baseTime + i * 3600
      const change = (Math.random() - 0.48) * volatility
      const open = lastClose
      const close = open + change
      const high = Math.max(open, close) + Math.random() * volatility * 0.5
      const low = Math.min(open, close) - Math.random() * volatility * 0.5
      candles.push({ time: time as any, open, high, low, close })
      lastClose = close
    }

    const entryIdx = 40
    candles[entryIdx] = {
      ...candles[entryIdx],
      close: entryPrice,
      open: entryPrice - (direction === 'LONG' ? volatility * 0.3 : -volatility * 0.3),
    }

    if (exitPrice && exitPrice > 0) {
      const exitIdx = Math.min(entryIdx + 15, candles.length - 1)
      candles[exitIdx] = {
        ...candles[exitIdx],
        close: exitPrice,
        open: exitPrice + (direction === 'LONG' ? -volatility * 0.2 : volatility * 0.2),
      }
    }

    candleSeries.setData(candles)

    candleSeries.createPriceLine({
      price: entryPrice,
      color: '#00F5FF',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: `Entry ${entryPrice}`,
    })

    if (exitPrice && exitPrice > 0) {
      const exitColor = (direction === 'LONG' ? exitPrice > entryPrice : exitPrice < entryPrice) ? '#00E676' : '#FF1744'
      candleSeries.createPriceLine({
        price: exitPrice,
        color: exitColor,
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: `Exit ${exitPrice}`,
      })
    }

    if (stopLoss && stopLoss > 0) {
      candleSeries.createPriceLine({
        price: stopLoss,
        color: '#FF1744',
        lineWidth: 1,
        lineStyle: 1,
        axisLabelVisible: true,
        title: 'SL',
      })
    }

    if (takeProfit && takeProfit > 0) {
      candleSeries.createPriceLine({
        price: takeProfit,
        color: '#00E676',
        lineWidth: 1,
        lineStyle: 1,
        axisLabelVisible: true,
        title: 'TP',
      })
    }

    chart.timeScale().fitContent()

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [pair, entryPrice, exitPrice, stopLoss, takeProfit, direction, entryTime])

  return (
    <div className="rounded-xl overflow-hidden border border-white/5">
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02]">
        <span className="text-[10px] font-mono font-bold text-brand-cyan">{pair}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-[#00F5FF] rounded" />
            <span className="text-[8px] text-brand-silver">Entry</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-[#FF1744] rounded" />
            <span className="text-[8px] text-brand-silver">SL</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-[#00E676] rounded" />
            <span className="text-[8px] text-brand-silver">TP</span>
          </div>
        </div>
      </div>
      <div ref={containerRef} />
    </div>
  )
}
