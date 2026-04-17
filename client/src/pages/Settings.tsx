import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Shield,
  Bell,
  Database,
  BookOpen,
  Target,
  DollarSign,
  Clock,
  Upload,
  Download,
  Trash2,
  Check,
  AlertTriangle,
  Flame,
  Globe,
  Key,
  Plus,
  X,
  Loader2,
} from 'lucide-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import CsvImport from '../components/trade/CsvImport'
import { useSettingsStore } from '../stores/settingsStore'
import toast from 'react-hot-toast'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'trading', label: 'Trading Rules', icon: Target },
  { id: 'risk', label: 'Risk Limits', icon: Shield },
  { id: 'connections', label: 'Connections', icon: Globe },
  { id: 'data', label: 'Data', icon: Database },
]

export default function Settings() {
  const { profile, riskSettings, rules, isLoading, fetchSettings, updateProfile, updateRisk, addRule, deleteRule } = useSettingsStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [newRule, setNewRule] = useState('')

  // Local form state
  const [profileForm, setProfileForm] = useState({
    displayName: '', broker: '', accountCurrency: 'USD', startingBalance: 10000, timezone: 'UTC+0',
  })
  const [riskForm, setRiskForm] = useState({
    maxRiskPerTrade: 1, dailyLossLimit: 300, weeklyLossLimit: 800, monthlyLossLimit: 2000,
    maxDrawdownPercent: 10, maxOpenTrades: 3, maxTradesPerDay: 5,
    pauseOnDailyLimit: true, flagRevengeTrades: true, reduceOnDrawdown: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || '',
        broker: profile.broker || '',
        accountCurrency: profile.accountCurrency || 'USD',
        startingBalance: profile.startingBalance || 10000,
        timezone: profile.timezone || 'UTC+0',
      })
    }
  }, [profile])

  useEffect(() => {
    if (riskSettings) {
      setRiskForm({
        maxRiskPerTrade: riskSettings.maxRiskPerTrade,
        dailyLossLimit: riskSettings.dailyLossLimit,
        weeklyLossLimit: riskSettings.weeklyLossLimit,
        monthlyLossLimit: riskSettings.monthlyLossLimit,
        maxDrawdownPercent: riskSettings.maxDrawdownPercent,
        maxOpenTrades: riskSettings.maxOpenTrades,
        maxTradesPerDay: riskSettings.maxTradesPerDay,
        pauseOnDailyLimit: riskSettings.pauseOnDailyLimit,
        flagRevengeTrades: riskSettings.flagRevengeTrades,
        reduceOnDrawdown: riskSettings.reduceOnDrawdown,
      })
    }
  }, [riskSettings])

  const handleSaveProfile = async () => {
    setSaving(true)
    const ok = await updateProfile(profileForm)
    toast[ok ? 'success' : 'error'](ok ? 'Profile saved!' : 'Failed to save')
    setSaving(false)
  }

  const handleSaveRisk = async () => {
    setSaving(true)
    const ok = await updateRisk(riskForm)
    toast[ok ? 'success' : 'error'](ok ? 'Risk settings saved!' : 'Failed to save')
    setSaving(false)
  }

  const handleAddRule = async () => {
    if (!newRule.trim()) return
    const ok = await addRule(newRule.trim())
    if (ok) { setNewRule(''); toast.success('Rule added!') }
  }

  const handleDeleteRule = async (id: string) => {
    await deleteRule(id)
    toast.success('Rule removed')
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6"
      >
        <motion.div variants={item}>
          <h1 className="text-2xl sm:text-3xl font-display font-bold"><span className="text-brand-text">Settings</span></h1>
          <p className="text-xs sm:text-sm text-brand-silver mt-1">Configure your Quantflow experience.</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Tabs */}
          <motion.div variants={item} className="lg:w-56 flex-shrink-0">
            <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 lg:glass-card lg:p-2">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'bg-brand-cyan/10 text-brand-cyan' : 'text-brand-silver hover:text-brand-text hover:bg-white/5'}`}>
                  <tab.icon className="w-4 h-4" />{tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <div className="flex-1 space-y-4">

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="glass-card p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text mb-4">Account Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Display Name</label>
                      <input type="text" value={profileForm.displayName} onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Broker</label>
                      <select value={profileForm.broker} onChange={(e) => setProfileForm({ ...profileForm, broker: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors">
                        {['OANDA', 'IC Markets', 'Pepperstone', 'FXCM', 'XM', 'Exness', 'Other'].map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Account Currency</label>
                      <select value={profileForm.accountCurrency} onChange={(e) => setProfileForm({ ...profileForm, accountCurrency: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors">
                        {['USD', 'EUR', 'GBP', 'NGN'].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Starting Balance</label>
                      <input type="number" value={profileForm.startingBalance} onChange={(e) => setProfileForm({ ...profileForm, startingBalance: parseFloat(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.98 }} onClick={handleSaveProfile} disabled={saving} className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet text-sm font-display font-semibold text-brand-space shadow-lg shadow-brand-cyan/20 disabled:opacity-50 flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Profile
                  </motion.button>
                </div>

                {/* T2R Badge */}
                <div className="glass-card p-4 sm:p-6 relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-violet/10 rounded-full blur-3xl" />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-violet to-brand-cyan flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div>
                    <div>
                      <p className="text-sm font-display font-bold text-brand-text">Trade2Retire Academy</p>
                      <p className="text-[10px] text-brand-silver flex items-center gap-1"><Flame className="w-3 h-3 text-brand-violet" /> Powering your AI coaching insights</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TRADING RULES */}
            {activeTab === 'trading' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="glass-card p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text mb-1">Pre-Trade Checklist</h3>
                  <p className="text-[10px] sm:text-xs text-brand-silver mb-4">These rules must be checked before every trade.</p>
                  <div className="space-y-2">
                    {rules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md bg-brand-profit/10 flex items-center justify-center"><Check className="w-3 h-3 text-brand-profit" /></div>
                          <span className="text-xs sm:text-sm text-brand-text">{rule.text}</span>
                        </div>
                        <button onClick={() => handleDeleteRule(rule.id)} className="text-[9px] text-brand-silver/40 hover:text-brand-loss transition-colors opacity-0 group-hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input type="text" value={newRule} onChange={(e) => setNewRule(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddRule()} placeholder="Add a new rule..." className="flex-1 px-4 py-2.5 rounded-xl bg-brand-space border border-white/10 text-xs text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddRule} className="px-4 py-2.5 rounded-xl bg-brand-cyan/15 text-brand-cyan text-xs font-medium hover:bg-brand-cyan/25 transition-colors flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add</motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* RISK LIMITS */}
            {activeTab === 'risk' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="glass-card p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text mb-4">Risk Parameters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Max Risk Per Trade (%)', key: 'maxRiskPerTrade', icon: Target, step: 0.1 },
                      { label: 'Daily Loss Limit ($)', key: 'dailyLossLimit', icon: DollarSign, step: 50 },
                      { label: 'Weekly Loss Limit ($)', key: 'weeklyLossLimit', icon: DollarSign, step: 100 },
                      { label: 'Monthly Loss Limit ($)', key: 'monthlyLossLimit', icon: DollarSign, step: 200 },
                      { label: 'Max Drawdown (%)', key: 'maxDrawdownPercent', icon: Shield, step: 1 },
                      { label: 'Max Trades Per Day', key: 'maxTradesPerDay', icon: Clock, step: 1 },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">{f.label}</label>
                        <div className="relative">
                          <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/40" />
                          <input type="number" step={f.step} value={(riskForm as any)[f.key]} onChange={(e) => setRiskForm({ ...riskForm, [f.key]: parseFloat(e.target.value) })} className="w-full pl-9 pr-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text mb-4">Auto-Protection</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Pause trading when daily loss limit is hit', key: 'pauseOnDailyLimit' },
                      { label: 'Flag revenge trades automatically', key: 'flagRevengeTrades' },
                      { label: 'Reduce lot size during drawdown', key: 'reduceOnDrawdown' },
                    ].map((toggle) => (
                      <div key={toggle.key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                        <span className="text-xs sm:text-sm text-brand-text">{toggle.label}</span>
                        <button onClick={() => setRiskForm({ ...riskForm, [toggle.key]: !(riskForm as any)[toggle.key] })} className={`w-11 h-6 rounded-full transition-colors relative ${(riskForm as any)[toggle.key] ? 'bg-brand-cyan' : 'bg-white/10'}`}>
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${(riskForm as any)[toggle.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSaveRisk} disabled={saving} className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet text-sm font-display font-semibold text-brand-space shadow-lg shadow-brand-cyan/20 disabled:opacity-50 flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Risk Settings
                </motion.button>
              </motion.div>
            )}

            {/* CONNECTIONS */}
            {activeTab === 'connections' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="glass-card p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text mb-1">Broker Connections</h3>
                  <p className="text-[10px] sm:text-xs text-brand-silver mb-4">Sync trades automatically.</p>
                  <div className="space-y-3">
                    {[
                      { name: 'MetaTrader 4', action: 'Import CSV', available: true },
                      { name: 'MetaTrader 5', action: 'Import CSV', available: true },
                      { name: 'cTrader', action: 'Import CSV', available: true },
                      { name: 'OANDA API', action: 'Coming Soon', available: false },
                    ].map((b) => (
                      <div key={b.name} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-xs sm:text-sm font-semibold text-brand-text">{b.name}</p>
                        <button onClick={() => b.available && setShowImport(true)} className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-colors ${b.available ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 hover:bg-brand-cyan/20' : 'bg-white/5 text-brand-silver/50 cursor-not-allowed'}`}>
                          {b.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* DATA */}
            {activeTab === 'data' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="glass-card p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text mb-4">Import Trades</h3>
                  <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setShowImport(true)} className="w-full p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-brand-cyan/30 transition-colors text-center">
                    <Upload className="w-8 h-8 text-brand-silver/30 mx-auto mb-2" />
                    <p className="text-sm text-brand-silver">Click to import MT4/MT5/cTrader CSV</p>
                    <p className="text-[10px] text-brand-silver/50 mt-1">All trades auto-calculated on import</p>
                  </motion.button>
                </div>

                <div className="glass-card p-4 sm:p-6 border-brand-loss/10">
                  <h3 className="text-sm font-display font-semibold text-brand-loss mb-3">Danger Zone</h3>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-loss/10 text-brand-loss text-xs font-medium border border-brand-loss/20 hover:bg-brand-loss/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Clear All Trades
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* CSV Import Modal */}
      <CsvImport open={showImport} onClose={() => setShowImport(false)} />
    </div>
  )
}
