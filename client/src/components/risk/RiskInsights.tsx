import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Tiltmeter from '../ui/Tiltmeter'
import WhatIfSimulator from '../trade/WhatIfSimulator'
import { useTradeStore } from '../../stores/tradeStore'

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
}

export default function RiskInsights() {
  const { trades, fetchTrades } = useTradeStore()

  useEffect(() => {
    fetchTrades()
  }, [fetchTrades])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <motion.div variants={item} initial="hidden" animate="show">
        <Tiltmeter recentTrades={trades} />
      </motion.div>
      <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
        <WhatIfSimulator trades={trades} />
      </motion.div>
    </div>
  )
}
