import { useEffect, useState } from 'react'

interface Props {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}

export default function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, duration = 1500 }: Props) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = eased * value

      setDisplay(current)

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [value, duration])

  return (
    <span className="font-mono font-bold tabular-nums">
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  )
}
