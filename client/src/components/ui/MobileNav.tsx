import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Bot,
  MoreHorizontal,
} from 'lucide-react'
import { useState } from 'react'

const mainTabs = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/ai-coach', icon: Bot, label: 'AI Coach' },
]

const moreTabs = [
  { to: '/risk', label: 'Risk Manager' },
  { to: '/market', label: 'Market Intel' },
  { to: '/settings', label: 'Settings' },
]

export default function MobileNav() {
  const [showMore, setShowMore] = useState(false)
  const location = useLocation()
  const isMoreActive = moreTabs.some((t) => t.to === location.pathname)

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 left-4 right-4 bg-brand-obsidian border border-white/10 rounded-2xl p-2 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {moreTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                onClick={() => setShowMore(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-cyan/10 text-brand-cyan'
                      : 'text-brand-silver hover:text-brand-text hover:bg-white/5'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}

            {/* Trade2Retire Badge */}
            <div className="mx-3 mt-2 mb-1 p-3 rounded-xl bg-gradient-to-br from-brand-violet/20 to-brand-cyan/10 border border-brand-violet/20">
              <p className="text-[9px] uppercase tracking-widest text-brand-violet font-semibold">Powered by</p>
              <p className="text-xs font-bold text-brand-text mt-0.5">Trade2Retire Academy</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-obsidian/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around px-2 py-1.5">
          {mainTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className="relative flex flex-col items-center py-1.5 px-3"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="mobileTab"
                      className="absolute -top-1.5 w-8 h-0.5 rounded-full bg-brand-cyan"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-brand-cyan/10' : ''
                    }`}
                  >
                    <tab.icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-brand-cyan' : 'text-brand-silver/60'
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`text-[9px] font-medium mt-0.5 transition-colors ${
                      isActive ? 'text-brand-cyan' : 'text-brand-silver/40'
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* More Button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="relative flex flex-col items-center py-1.5 px-3"
          >
            {isMoreActive && (
              <motion.div
                className="absolute -top-1.5 w-8 h-0.5 rounded-full bg-brand-cyan"
              />
            )}
            <motion.div
              whileTap={{ scale: 0.85 }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isMoreActive ? 'bg-brand-cyan/10' : ''
              }`}
            >
              <MoreHorizontal
                className={`w-5 h-5 ${isMoreActive ? 'text-brand-cyan' : 'text-brand-silver/60'}`}
              />
            </motion.div>
            <span className={`text-[9px] font-medium mt-0.5 ${isMoreActive ? 'text-brand-cyan' : 'text-brand-silver/40'}`}>
              More
            </span>
          </button>
        </div>

        {/* Safe area for iPhones with home bar */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  )
}
