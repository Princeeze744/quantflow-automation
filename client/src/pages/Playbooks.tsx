import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookMarked, Plus, X, Check, Trash2, Edit3, Target,
  Clock, Zap, TrendingUp, ChevronDown, Loader2, Flame,
} from 'lucide-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import { instruments } from '../utils/instruments'
import api from '../services/api'
import toast from 'react-hot-toast'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } } }

const colors = ['#00F5FF', '#7C5CFC', '#00E676', '#FF1744', '#FFC107', '#FF5722', '#E91E63', '#00BCD4']
const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1']
const sessionOptions = ['TOKYO', 'LONDON', 'NEWYORK', 'SYDNEY', 'OVERLAP']
const setupTypes = ['Pullback', 'Breakout', 'Reversal', 'Trend Continuation', 'Range', 'News Spike', 'Scalp', 'Swing', 'Mean Reversion', 'Momentum']

interface Playbook {
  id: string; name: string; description: string; setupType: string; timeframe: string;
  entryRules: string; exitRules: string; confluences: string; riskPerTrade: number;
  minRR: number; idealSessions: string; idealPairs: string; notes: string;
  isActive: boolean; totalTrades: number; winRate: number; avgRR: number;
  totalPnl: number; color: string; createdAt: string;
}

const emptyForm = {
  name: '', description: '', setupType: 'Pullback', timeframe: 'H1',
  entryRules: [''], exitRules: [''], confluences: [''],
  riskPerTrade: 1.0, minRR: 1.5, idealSessions: [] as string[],
  idealPairs: [] as string[], notes: '', color: '#7C5CFC',
}

export default function Playbooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchPlaybooks = async () => {
    try {
      const res = await api.get('/playbooks')
      setPlaybooks(res.data.playbooks)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchPlaybooks() }, [])

  const addRule = (field: 'entryRules' | 'exitRules' | 'confluences') => {
    setForm({ ...form, [field]: [...form[field], ''] })
  }

  const updateRule = (field: 'entryRules' | 'exitRules' | 'confluences', idx: number, val: string) => {
    const arr = [...form[field]]
    arr[idx] = val
    setForm({ ...form, [field]: arr })
  }

  const removeRule = (field: 'entryRules' | 'exitRules' | 'confluences', idx: number) => {
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== idx) })
  }

  const toggleSession = (s: string) => {
    setForm({ ...form, idealSessions: form.idealSessions.includes(s) ? form.idealSessions.filter((x) => x !== s) : [...form.idealSessions, s] })
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Playbook name is required'); return }
    setSubmitting(true)
    try {
      await api.post('/playbooks', {
        ...form,
        entryRules: form.entryRules.filter((r) => r.trim()),
        exitRules: form.exitRules.filter((r) => r.trim()),
        confluences: form.confluences.filter((r) => r.trim()),
      })
      toast.success('Playbook created!')
      setForm(emptyForm)
      setShowForm(false)
      fetchPlaybooks()
    } catch { toast.error('Failed to create playbook') }
    setSubmitting(false)
  }

  const deletePlaybook = async (id: string) => {
    if (!confirm('Delete this playbook?')) return
    try {
      await api.delete(`/playbooks/${id}`)
      toast.success('Playbook deleted')
      fetchPlaybooks()
    } catch { toast.error('Failed to delete') }
  }

  const parseJson = (str: string) => { try { return JSON.parse(str) } catch { return [] } }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">
              <span className="text-brand-text">Strategy </span>
              <span className="text-gradient">Playbooks</span>
            </h1>
            <p className="text-xs sm:text-sm text-brand-silver mt-1">Define your edge. Execute with precision. Review with data.</p>
          </div>
          <motion.button onClick={() => setShowForm(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-cyan to-brand-violet rounded-xl text-sm font-semibold text-brand-space shadow-lg shadow-brand-cyan/20">
            <Plus className="w-4 h-4" /> New Playbook
          </motion.button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-cyan animate-spin" /></div>
        ) : playbooks.length === 0 ? (
          <motion.div variants={item} className="glass-card p-12 text-center">
            <BookMarked className="w-12 h-12 text-brand-violet/20 mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-brand-text mb-2">No Playbooks Yet</h3>
            <p className="text-sm text-brand-silver mb-4">Create your first strategy playbook to standardize your trading.</p>
            <motion.button onClick={() => setShowForm(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-cyan to-brand-violet rounded-xl text-sm font-semibold text-brand-space">
              Create First Playbook
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {playbooks.map((pb) => (
              <motion.div key={pb.id} variants={item} className="glass-card-hover p-4 sm:p-5 cursor-pointer"
                onClick={() => setExpanded(expanded === pb.id ? null : pb.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: pb.color + '20' }}>
                      <BookMarked className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: pb.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-display font-bold text-brand-text">{pb.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-brand-silver">{pb.setupType}</span>
                        {pb.timeframe && <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-brand-silver">{pb.timeframe}</span>}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-brand-silver transition-transform ${expanded === pb.id ? 'rotate-180' : ''}`} />
                </div>

                {pb.description && <p className="text-[11px] sm:text-xs text-brand-silver mt-3 leading-relaxed">{pb.description}</p>}

                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[
                    { label: 'Trades', value: pb.totalTrades.toString(), color: 'text-brand-text' },
                    { label: 'Win Rate', value: `${pb.winRate}%`, color: pb.winRate >= 50 ? 'text-brand-profit' : 'text-brand-loss' },
                    { label: 'Avg R:R', value: pb.avgRR.toFixed(1), color: 'text-brand-cyan' },
                    { label: 'P&L', value: `$${pb.totalPnl.toFixed(0)}`, color: pb.totalPnl >= 0 ? 'text-brand-profit' : 'text-brand-loss' },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-2 rounded-lg bg-white/[0.02]">
                      <p className="text-[7px] sm:text-[8px] uppercase text-brand-silver">{s.label}</p>
                      <p className={`text-xs sm:text-sm font-mono font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {expanded === pb.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                        {[
                          { label: 'Entry Rules', data: parseJson(pb.entryRules), color: 'text-brand-cyan' },
                          { label: 'Exit Rules', data: parseJson(pb.exitRules), color: 'text-brand-profit' },
                          { label: 'Confluences', data: parseJson(pb.confluences), color: 'text-brand-violet' },
                        ].map((section) => (
                          <div key={section.label}>
                            <p className="text-[9px] uppercase tracking-wider text-brand-silver mb-1">{section.label}</p>
                            <div className="space-y-1">
                              {section.data.map((rule: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-[11px] sm:text-xs">
                                  <Check className={`w-3 h-3 ${section.color} flex-shrink-0`} />
                                  <span className="text-brand-text">{rule}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-brand-silver mb-1">Risk Per Trade</p>
                            <p className="text-xs font-mono font-bold text-brand-text">{pb.riskPerTrade}%</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-brand-silver mb-1">Min R:R</p>
                            <p className="text-xs font-mono font-bold text-brand-text">{pb.minRR}:1</p>
                          </div>
                        </div>

                        {pb.notes && (
                          <div className="p-3 rounded-xl bg-brand-space/50 border border-white/5">
                            <p className="text-[9px] uppercase tracking-wider text-brand-violet mb-1">Notes</p>
                            <p className="text-[11px] sm:text-xs text-brand-silver leading-relaxed">{pb.notes}</p>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); deletePlaybook(pb.id) }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-loss/10 text-brand-loss text-[10px] sm:text-xs hover:bg-brand-loss/20 transition-colors">
                            <Trash2 className="w-3 h-3" /> Delete
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Playbook Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl my-4 glass-card p-5 sm:p-6 border border-white/10">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-brand-text">New Playbook</h2>
                  <p className="text-[10px] sm:text-xs text-brand-silver mt-1">Define your strategy rules clearly.</p>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-silver hover:text-brand-text">
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Name + Color */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Playbook Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. London Pullback A+"
                      className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Color</label>
                    <div className="flex flex-wrap gap-1.5">
                      {colors.map((c) => (
                        <button key={c} onClick={() => setForm({ ...form, color: c })}
                          className={`w-6 h-6 rounded-lg border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Description</label>
                  <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this strategy..."
                    className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 transition-colors resize-none" />
                </div>

                {/* Setup + Timeframe */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Setup Type</label>
                    <select value={form.setupType} onChange={(e) => setForm({ ...form, setupType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors">
                      {setupTypes.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Timeframe</label>
                    <div className="flex flex-wrap gap-1">
                      {timeframes.map((tf) => (
                        <button key={tf} onClick={() => setForm({ ...form, timeframe: tf })}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-colors border ${form.timeframe === tf ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30' : 'bg-white/5 text-brand-silver border-white/10'}`}>
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Entry Rules */}
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-brand-cyan mb-1.5 block flex items-center gap-1"><Target className="w-3 h-3" /> Entry Rules</label>
                  {form.entryRules.map((rule, i) => (
                    <div key={i} className="flex gap-2 mb-1.5">
                      <input type="text" value={rule} onChange={(e) => updateRule('entryRules', i, e.target.value)} placeholder={`Entry rule ${i + 1}...`}
                        className="flex-1 px-3 py-2 rounded-lg bg-brand-space border border-white/10 text-xs text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30" />
                      {form.entryRules.length > 1 && (
                        <button onClick={() => removeRule('entryRules', i)} className="text-brand-silver/40 hover:text-brand-loss"><X className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addRule('entryRules')} className="text-[10px] text-brand-cyan hover:text-brand-cyan/80">+ Add rule</button>
                </div>

                {/* Exit Rules */}
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-brand-profit mb-1.5 block flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Exit Rules</label>
                  {form.exitRules.map((rule, i) => (
                    <div key={i} className="flex gap-2 mb-1.5">
                      <input type="text" value={rule} onChange={(e) => updateRule('exitRules', i, e.target.value)} placeholder={`Exit rule ${i + 1}...`}
                        className="flex-1 px-3 py-2 rounded-lg bg-brand-space border border-white/10 text-xs text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-profit/30" />
                      {form.exitRules.length > 1 && <button onClick={() => removeRule('exitRules', i)} className="text-brand-silver/40 hover:text-brand-loss"><X className="w-3.5 h-3.5" /></button>}
                    </div>
                  ))}
                  <button onClick={() => addRule('exitRules')} className="text-[10px] text-brand-profit hover:text-brand-profit/80">+ Add rule</button>
                </div>

                {/* Confluences */}
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-brand-violet mb-1.5 block flex items-center gap-1"><Zap className="w-3 h-3" /> Confluences Required</label>
                  {form.confluences.map((rule, i) => (
                    <div key={i} className="flex gap-2 mb-1.5">
                      <input type="text" value={rule} onChange={(e) => updateRule('confluences', i, e.target.value)} placeholder={`Confluence ${i + 1}...`}
                        className="flex-1 px-3 py-2 rounded-lg bg-brand-space border border-white/10 text-xs text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-violet/30" />
                      {form.confluences.length > 1 && <button onClick={() => removeRule('confluences', i)} className="text-brand-silver/40 hover:text-brand-loss"><X className="w-3.5 h-3.5" /></button>}
                    </div>
                  ))}
                  <button onClick={() => addRule('confluences')} className="text-[10px] text-brand-violet hover:text-brand-violet/80">+ Add confluence</button>
                </div>

                {/* Risk + R:R */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Risk Per Trade %</label>
                    <input type="number" step="0.1" value={form.riskPerTrade} onChange={(e) => setForm({ ...form, riskPerTrade: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Minimum R:R</label>
                    <input type="number" step="0.1" value={form.minRR} onChange={(e) => setForm({ ...form, minRR: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                  </div>
                </div>

                {/* Sessions */}
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Ideal Sessions</label>
                  <div className="flex flex-wrap gap-2">
                    {sessionOptions.map((s) => (
                      <button key={s} onClick={() => toggleSession(s)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${form.idealSessions.includes(s) ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30' : 'bg-white/5 text-brand-silver border-white/10'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Notes</label>
                  <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..."
                    className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 transition-colors resize-none" />
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet text-sm font-display font-bold text-brand-space shadow-lg shadow-brand-cyan/20 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Playbook'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
