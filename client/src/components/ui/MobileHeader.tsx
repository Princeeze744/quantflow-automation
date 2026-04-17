import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Bell, User, LogOut, X } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export default function MobileHeader() {
  const { user, logout } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 bg-brand-obsidian/90 backdrop-blur-xl border-b border-white/5"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-violet flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand-space" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-brand-text tracking-wide leading-none">
                QUANTFLOW
              </h1>
              <p className="text-[8px] text-brand-silver tracking-widest uppercase leading-none mt-0.5">
                Automation
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center"
            >
              <Bell className="w-4 h-4 text-brand-silver" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-xl bg-brand-violet/20 flex items-center justify-center"
            >
              <span className="text-xs font-bold text-brand-violet">
                {(user?.displayName || 'T')[0].toUpperCase()}
              </span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Profile Dropdown */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-16 right-4 w-64 glass-card p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-violet/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-violet">
                      {(user?.displayName || 'T')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-text">{user?.displayName || 'Trader'}</p>
                    <p className="text-[10px] text-brand-silver">{user?.email}</p>
                  </div>
                </div>
                <button onClick={() => setShowMenu(false)} className="text-brand-silver">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="border-t border-white/5 pt-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-loss hover:bg-brand-loss/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
