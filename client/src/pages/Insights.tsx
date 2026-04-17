import { useEffect } from 'react'
import { motion } from 'framer-motion'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import Tiltmeter from '../components/ui/Tiltmeter'
import WhatIfSimulator from '../components/trade/WhatIfSimulator'
import TradeChart from '../components/trade/TradeChart'
import { useTradeStore } from '../stores/tradeStore'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
}

export default function Insights() {
  const { trades, fetchTrades } = useTradeStore()

  useEffect(() => {
    fetchTrades()
  }, [fetchTrades])

  const recentTrade = trades[0]

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6"
      >
        {/* Header */}
        <motion.div variants={item}>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">
            <span className="text-brand-text">Trading </span>
            <span className="text-gradient">Insights</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-silver mt-1">
            Deep analysis powered by your data and Trade2Retire Academy AI.
          </p>
        </motion.div>

        {/* Tiltmeter + What-If */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <motion.div variants={item}>
            <Tiltmeter recentTrades={trades} />
          </motion.div>
          <motion.div variants={item}>
            <WhatIfSimulator trades={trades} />
          </motion.div>
        </div>

        {/* Latest Trade Chart */}
        {recentTrade && (
          <motion.div variants={item} className="glass-card p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text mb-4">
              Latest Trade Analysis — {recentTrade.pair} {recentTrade.direction}
            </h3>
            <TradeChart
              pair={recentTrade.pair}
              entryPrice={recentTrade.entryPrice}
              exitPrice={recentTrade.exitPrice}
              stopLoss={recentTrade.stopLoss}
              takeProfit={recentTrade.takeProfit}
              direction={recentTrade.direction}
              entryTime={recentTrade.entryTime}
              exitTime={recentTrade.exitTime}
            />
          </motion.div>
        )}

        {/* All Trade Charts */}
        {trades.length > 1 && (
          <motion.div variants={item}>
            <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text mb-4">Trade History Charts</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {trades.slice(1, 5).map((trade) => (
                <div key={trade.id} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-text">{trade.pair}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded ${trade.direction === 'LONG' ? 'bg-brand-profit/10 text-brand-profit' : 'bg-brand-loss/10 text-brand-loss'}`}>{trade.direction}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold ${(trade.pnlDollars || 0) >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                      {(trade.pnlDollars || 0) >= 0 ? '+' : ''}${(trade.pnlDollars || 0).toFixed(2)}
                    </span>
                  </div>
                  <TradeChart
                    pair={trade.pair}
                    entryPrice={trade.entryPrice}
                    exitPrice={trade.exitPrice}
                    stopLoss={trade.stopLoss}
                    takeProfit={trade.takeProfit}
                    direction={trade.direction}
                    entryTime={trade.entryTime}
                    exitTime={trade.exitTime}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
