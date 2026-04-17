import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, X, Trash2, Loader2, Calendar, Flame, Brain } from 'lucide-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import api from '../services/api'
import toast from 'react-hot-toast'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } } }

const noteTypes = [
  { id: 'DAILY_PLAN', label: 'Daily Plan', icon: Calendar, color: 'text-brand-cyan' },
  { id: 'POST_MARKET', label: 'Post-Market', icon: Brain, color: 'text-brand-violet' },
  { id: 'WEEKLY_REVIEW', label: 'Weekly Review', icon: Flame, color: 'text-brand-profit' },
  { id: 'FREE', label: 'Free Note', icon: FileText, color: 'text-brand-silver' },
]

const moodEmojis = ['', '😤', '😟', '😐', '😊', '🔥']

const templates: Record<string, string> = {
  DAILY_PLAN: `## Pre-Market Plan\n\n**Market Bias:** \n**Key Levels:** \n**Pairs to Watch:** \n**Max Trades Today:** 3\n**Risk Per Trade:** 1%\n\n### Rules for Today\n- Only trade A+ setups\n- No revenge trades\n- Stop after 2 consecutive losses\n\n### Notes\n`,
  POST_MARKET: `## Post-Market Review\n\n**Trades Taken:** \n**Win/Loss:** \n**P&L:** \n\n### What Went Well\n- \n\n### What To Improve\n- \n\n### Lesson Learned\n`,
  WEEKLY_REVIEW: `## Weekly Performance Review\n\n**Total Trades:** \n**Win Rate:** \n**Net P&L:** \n**Best Trade:** \n**Worst Trade:** \n\n### Key Observations\n- \n\n### Goals for Next Week\n- \n`,
  FREE: '',
}

interface NotebookEntry { id: string; title: string; content: string; type: string; mood: number; date: string; createdAt: string }

export default function Notebook() {
  const [entries, setEntries] = useState<NotebookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ title: '', content: '', type: 'DAILY_PLAN', mood: 3 })
  const [submitting, setSubmitting] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchEntries = async () => {
    try {
      const params = filter ? `?type=${filter}` : ''
      const res = await api.get(`/notebook${params}`)
      setEntries(res.data.entries)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchEntries() }, [filter])

  const handleCreate = async () => {
    if (!form.content.trim()) { toast.error('Content is required'); return }
    setSubmitting(true)
    try {
      await api.post('/notebook', { ...form, title: form.title || noteTypes.find((t) => t.id === form.type)?.label || 'Note' })
      toast.success('Entry saved!')
      setForm({ title: '', content: '', type: 'DAILY_PLAN', mood: 3 })
      setShowForm(false)
      fetchEntries()
    } catch { toast.error('Failed to save') }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    try { await api.delete(`/notebook/${id}`); toast.success('Deleted'); fetchEntries() } catch {}
  }

  const openWithTemplate = (type: string) => {
    setForm({ title: '', content: templates[type] || '', type, mood: 3 })
    setShowForm(true)
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">
              <span className="text-brand-text">Trading </span>
              <span className="text-gradient">Notebook</span>
            </h1>
            <p className="text-xs sm:text-sm text-brand-silver mt-1">Plan your day. Review your performance. Grow as a trader.</p>
          </div>
        </motion.div>

        {/* Quick Create Cards */}
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {noteTypes.map((nt) => (
            <motion.button key={nt.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} onClick={() => openWithTemplate(nt.id)}
              className="glass-card-hover p-4 text-center group">
              <nt.icon className={`w-6 h-6 mx-auto mb-2 ${nt.color} group-hover:scale-110 transition-transform`} />
              <p className="text-xs sm:text-sm font-display font-semibold text-brand-text">{nt.label}</p>
              <p className="text-[9px] text-brand-silver mt-1">+ Create new</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Filter */}
        <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${!filter ? 'bg-brand-cyan/15 text-brand-cyan' : 'text-brand-silver hover:text-brand-text'}`}>All</button>
          {noteTypes.map((nt) => (
            <button key={nt.id} onClick={() => setFilter(nt.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === nt.id ? 'bg-brand-cyan/15 text-brand-cyan' : 'text-brand-silver hover:text-brand-text'}`}>{nt.label}</button>
          ))}
        </motion.div>

        {/* Entries */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-cyan animate-spin" /></div>
        ) : entries.length === 0 ? (
          <motion.div variants={item} className="glass-card p-12 text-center">
            <FileText className="w-12 h-12 text-brand-violet/20 mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-brand-text mb-2">No Entries Yet</h3>
            <p className="text-sm text-brand-silver">Start with a Daily Plan to build the journaling habit.</p>
          </motion.div>
        ) : (
          <motion.div variants={container} className="space-y-3">
            {entries.map((entry) => {
              const nt = noteTypes.find((t) => t.id === entry.type) || noteTypes[3]
              return (
                <motion.div key={entry.id} variants={item} onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                  className="glass-card-hover p-4 sm:p-5 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <nt.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${nt.color}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-display font-semibold text-brand-text">{entry.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-brand-silver">{new Date(entry.date).toLocaleDateString()}</span>
                          <span className="text-[9px] text-brand-silver">·</span>
                          <span className={`text-[9px] ${nt.color}`}>{nt.label}</span>
                          <span className="text-[9px]">{moodEmojis[entry.mood]}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expanded === entry.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <div className="prose prose-sm prose-invert max-w-none">
                            <pre className="text-xs sm:text-sm text-brand-silver leading-relaxed whitespace-pre-wrap font-body">{entry.content}</pre>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-loss/10 text-brand-loss text-[10px] hover:bg-brand-loss/20 transition-colors">
                              <Trash2 className="w-3 h-3" /> Delete
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl my-4 glass-card p-5 sm:p-6 border border-white/10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-display font-bold text-brand-text">{noteTypes.find((t) => t.id === form.type)?.label || 'New Entry'}</h2>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-silver"><X className="w-4 h-4" /></motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder={noteTypes.find((t) => t.id === form.type)?.label || 'Title'}
                    className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Mood</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setForm({ ...form, mood: n })}
                        className={`flex-1 py-2 rounded-lg text-center transition-colors border ${form.mood === n ? 'bg-brand-violet/20 text-brand-violet border-brand-violet/30' : 'bg-white/5 text-brand-silver border-transparent'}`}>
                        <span className="text-lg">{moodEmojis[n]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Content</label>
                  <textarea rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Write your thoughts..."
                    className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 transition-colors resize-none font-mono leading-relaxed" />
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet text-sm font-display font-bold text-brand-space shadow-lg shadow-brand-cyan/20 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Entry'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
