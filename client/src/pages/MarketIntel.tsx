import { motion } from 'framer-motion'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import SessionClock from '../components/market/SessionClock'
import CurrencyStrength from '../components/market/CurrencyStrength'
import EconomicCalendar from '../components/market/EconomicCalendar'
import CorrelationMatrix from '../components/market/CorrelationMatrix'
import NewsFeed from '../components/market/NewsFeed'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
}

export default function MarketIntel() {
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
            <span className="text-brand-text">Market </span>
            <span className="text-gradient">Intelligence</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-silver mt-1">
            Everything you need before placing a trade. All in one place.
          </p>
        </motion.div>

        {/* Session Clock + Currency Strength */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <motion.div variants={item}>
            <SessionClock />
          </motion.div>
          <motion.div variants={item}>
            <CurrencyStrength />
          </motion.div>
        </div>

        {/* Economic Calendar */}
        <motion.div variants={item}>
          <EconomicCalendar />
        </motion.div>

        {/* Correlation + News */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <motion.div variants={item}>
            <CorrelationMatrix />
          </motion.div>
          <motion.div variants={item}>
            <NewsFeed />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
