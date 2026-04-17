import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Mail, Lock, User, ArrowRight, Flame, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, register, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    let success: boolean
    if (isRegister) {
      success = await register(email, password, displayName || 'Trader')
    } else {
      success = await login(email, password)
    }
    if (success) navigate('/')
  }

  return (
    <div className="min-h-screen bg-brand-space flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-violet/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-violet/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-violet flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-cyan/20"
          >
            <TrendingUp className="w-8 h-8 text-brand-space" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-brand-text">QUANTFLOW</h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-brand-silver mt-1">Automation Trading Journal</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 border border-white/10">
          <h2 className="text-lg font-display font-semibold text-brand-text mb-1">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-brand-silver mb-6">
            {isRegister ? 'Start your journey to consistent profitability.' : 'Log in to your trading command center.'}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-brand-loss/10 border border-brand-loss/20"
            >
              <p className="text-xs text-brand-loss">{error}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            {isRegister && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/40" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your trader name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 focus:ring-1 focus:ring-brand-cyan/20 transition-all"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError() }}
                  placeholder="trader@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 focus:ring-1 focus:ring-brand-cyan/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError() }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 focus:ring-1 focus:ring-brand-cyan/20 transition-all"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver/40 hover:text-brand-silver transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet text-sm font-display font-bold text-brand-space shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/30 transition-shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-5 h-5 border-2 border-brand-space/30 border-t-brand-space rounded-full" />
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); clearError() }}
              className="text-xs text-brand-silver hover:text-brand-cyan transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

        {/* Trade2Retire Badge */}
        <div className="mt-6 text-center">
          <p className="text-[9px] text-brand-silver/50 flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-brand-violet/50" />
            Powered by Trade2Retire Academy
          </p>
        </div>
      </motion.div>
    </div>
  )
}
