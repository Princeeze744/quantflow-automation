import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Filter, TrendingUp, TrendingDown, ChevronDown, X,
  Brain, Clock, DollarSign, Target, AlertTriangle, CheckCircle2,
  Flame, Loader2, Trash2, Share2, Camera, Edit3,
} from 'lucide-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import TradeChart from '../components/trade/TradeChart'
import ShareCard from '../components/trade/ShareCard'
import EditTradeModal from '../components/trade/EditTradeModal'

import { instruments } from '../utils/instruments'
import { useTradeStore, Trade } from '../stores/tradeStore'
import toast from 'react-hot-toast'

const pairsList = instruments.map((i) => i.symbol)

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
}

const gradeColors: Record<string, string> = {
  A: 'text-brand-profit bg-brand-profit/10 border-brand-profit/20',
  B: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20',
  C: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  D: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  F: 'text-brand-loss bg-brand-loss/10 border-brand-loss/20',
}
const moodEmojis = ['', '😤', '😟', '😐', '😊', '🔥']
const setupTypes = ['Pullback', 'Breakout', 'Reversal', 'Trend Continuation', 'Range', 'News Spike', 'Scalp', 'Swing']

const emptyForm = {
  pair: 'EUR/USD', direction: 'LONG', entryPrice: '', exitPrice: '', stopLoss: '', takeProfit: '',
  lotSize: '', riskPercent: '', entryTime: '', exitTime: '', setup: 'Pullback',
  preMood: 3, preConfidence: 3, preEnergy: 3, preFocus: 3, postEmotion: 'NEUTRAL',
  revengeFlag: false, fomoFlag: false, reflectionText: '', grade: '',
}

export default function Journal() {
  const { trades, isLoading, fetchTrades, fetchTags, createTrade, deleteTrade } = useTradeStore()
  const [showNewTrade, setShowNewTrade] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [filters, setFilters] = useState({ pair: '', session: '', result: '' })
  const [shareTrade, setShareTrade] = useState<Trade | null>(null)
  const [editTrade, setEditTrade] = useState<Trade | null>(null)

  useEffect(() => { fetchTrades(); fetchTags() }, [fetchTrades, fetchTags])

  const updateForm = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.entryPrice || !form.lotSize || !form.entryTime) { toast.error('Entry price, lot size, and entry time required'); return }
    setSubmitting(true)
    const tradeData = {
      pair: form.pair, direction: form.direction,
      entryPrice: parseFloat(form.entryPrice), exitPrice: form.exitPrice ? parseFloat(form.exitPrice) : null,
      stopLoss: form.stopLoss ? parseFloat(form.stopLoss) : null, takeProfit: form.takeProfit ? parseFloat(form.takeProfit) : null,
      lotSize: parseFloat(form.lotSize), riskPercent: form.riskPercent ? parseFloat(form.riskPercent) : null,
      entryTime: form.entryTime, exitTime: form.exitTime || null,
      psychology: { preMood: form.preMood, preConfidence: form.preConfidence, preEnergy: form.preEnergy, preFocus: form.preFocus, postEmotion: form.postEmotion, revengeFlag: form.revengeFlag, fomoFlag: form.fomoFlag, reflectionText: form.reflectionText || null, grade: form.grade || null },
    }
    const success = await createTrade(tradeData)
    if (success) { toast.success('Trade logged!'); setForm(emptyForm); setShowNewTrade(false) } else { toast.error('Failed to log trade') }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this trade?')) { const ok = await deleteTrade(id); if (ok) { toast.success('Deleted'); setSelectedTrade(null) } }
  }

  const filtered = trades.filter((t) => {
    if (searchQuery) { const q = searchQuery.toLowerCase(); if (!t.pair.toLowerCase().includes(q) && !(t.psychology?.reflectionText || '').toLowerCase().includes(q)) return false }
    if (filters.pair && t.pair !== filters.pair) return false
    if (filters.session && t.session !== filters.session) return false
    if (filters.result === 'Winners' && (t.pnlDollars || 0) <= 0) return false
    if (filters.result === 'Losers' && (t.pnlDollars || 0) >= 0) return false
    return true
  })

  const totalPnl = filtered.reduce((sum, t) => sum + (t.pnlDollars || 0), 0)
  const winCount = filtered.filter((t) => (t.pnlDollars || 0) > 0).length
  const winRate = filtered.length > 0 ? ((winCount / filtered.length) * 100).toFixed(1) : '0'

  const formatDuration = (mins: number | null) => {
    if (!mins) return '-'; if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">
              <span className="text-brand-text">Trade </span><span className="text-gradient">Journal</span>
            </h1>
            <p className="text-xs sm:text-sm text-brand-silver mt-1">Every trade tells a story. Capture yours.</p>
          </div>
          <motion.button onClick={() => setShowNewTrade(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-cyan to-brand-violet rounded-xl text-sm font-semibold text-brand-space shadow-lg shadow-brand-cyan/20">
            <Plus className="w-4 h-4" /> New Trade
          </motion.button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Trades', value: filtered.length.toString(), icon: Target, color: 'text-brand-cyan' },
            { label: 'Win Rate', value: `${winRate}%`, icon: CheckCircle2, color: 'text-brand-profit' },
            { label: 'Net P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, icon: DollarSign, color: totalPnl >= 0 ? 'text-brand-profit' : 'text-brand-loss' },
            { label: 'Avg R:R', value: filtered.length > 0 ? `${(filtered.reduce((s, t) => s + Math.abs(t.rrActual || 0), 0) / filtered.length).toFixed(2)}R` : '0R', icon: Flame, color: 'text-brand-violet' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-3 sm:p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center"><stat.icon className={`w-4 h-4 ${stat.color}`} /></div>
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver">{stat.label}</p>
                <p className={`text-base sm:text-lg font-mono font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div variants={item} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by pair, notes..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-brand-obsidian/80 border border-white/5 text-sm text-brand-text placeholder-brand-silver/50 focus:outline-none focus:border-brand-cyan/30 transition-all" />
          </div>
          <motion.button onClick={() => setFilterOpen(!filterOpen)} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl glass-card text-sm text-brand-silver hover:text-brand-text transition-all">
            <Filter className="w-4 h-4" /><span className="hidden sm:inline">Filters</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </motion.button>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="glass-card p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Pair</label>
                  <select value={filters.pair} onChange={(e) => setFilters({ ...filters, pair: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30">
                    <option value="">All Pairs</option>
                    {[...new Set(trades.map((t) => t.pair))].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Session</label>
                  <select value={filters.session} onChange={(e) => setFilters({ ...filters, session: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30">
                    <option value="">All Sessions</option>
                    {['TOKYO', 'LONDON', 'NEWYORK', 'SYDNEY', 'OVERLAP'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Result</label>
                  <select value={filters.result} onChange={(e) => setFilters({ ...filters, result: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30">
                    <option value="">All</option><option>Winners</option><option>Losers</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trade List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-brand-cyan animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <motion.div variants={item} className="glass-card p-12 text-center">
            <TrendingUp className="w-12 h-12 text-brand-cyan/20 mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-brand-text mb-2">No trades yet</h3>
            <p className="text-sm text-brand-silver mb-4">Log your first trade to start building your journal.</p>
            <motion.button onClick={() => setShowNewTrade(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-cyan to-brand-violet rounded-xl text-sm font-semibold text-brand-space">Log First Trade</motion.button>
          </motion.div>
        ) : (
          <motion.div variants={container} className="space-y-3">
            {filtered.map((trade) => (
              <motion.div key={trade.id} variants={item} onClick={() => setSelectedTrade(selectedTrade === trade.id ? null : trade.id)} className="glass-card-hover p-4 sm:p-5 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${(trade.pnlDollars || 0) >= 0 ? 'bg-brand-profit/10' : 'bg-brand-loss/10'}`}>
                      {trade.direction === 'LONG' ? <TrendingUp className={`w-5 h-5 ${(trade.pnlDollars || 0) >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`} /> : <TrendingDown className={`w-5 h-5 ${(trade.pnlDollars || 0) >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-mono font-bold text-brand-text">{trade.pair}</span>
                        <span className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md ${trade.direction === 'LONG' ? 'bg-brand-profit/10 text-brand-profit' : 'bg-brand-loss/10 text-brand-loss'}`}>{trade.direction}</span>
                        {trade.psychology?.grade && <span className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md border ${gradeColors[trade.psychology.grade] || ''}`}>{trade.psychology.grade}</span>}
                        {trade.psychology?.revengeFlag && <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-brand-loss/10 text-brand-loss border border-brand-loss/20 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> REVENGE</span>}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-[11px] text-brand-silver flex-wrap">
                        <span>{trade.session || '-'}</span><span>·</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(trade.holdDurationMin)}</span>
                        {trade.psychology && <><span>·</span><span>{moodEmojis[trade.psychology.preMood]}</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-base sm:text-lg font-mono font-bold ${(trade.pnlDollars || 0) >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>{(trade.pnlDollars || 0) >= 0 ? '+' : ''}${(trade.pnlDollars || 0).toFixed(2)}</p>
                    <p className={`text-[10px] sm:text-xs font-mono ${(trade.pnlDollars || 0) >= 0 ? 'text-brand-profit/60' : 'text-brand-loss/60'}`}>{(trade.rrActual || 0) >= 0 ? '+' : ''}{(trade.rrActual || 0).toFixed(2)}R · {(trade.pnlPips || 0) >= 0 ? '+' : ''}{(trade.pnlPips || 0).toFixed(0)} pips</p>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedTrade === trade.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-white/5 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {[
                          { label: 'Entry', value: trade.entryPrice?.toString() || '-' },
                          { label: 'Exit', value: trade.exitPrice?.toString() || 'Open' },
                          { label: 'Stop Loss', value: trade.stopLoss?.toString() || '-' },
                          { label: 'Take Profit', value: trade.takeProfit?.toString() || '-' },
                          { label: 'Lot Size', value: trade.lotSize?.toString() || '-' },
                          { label: 'Risk %', value: trade.riskPercent ? `${trade.riskPercent}%` : '-' },
                          { label: 'Confidence', value: trade.psychology ? `${trade.psychology.preConfidence}/5` : '-' },
                          { label: 'Mood', value: trade.psychology ? moodEmojis[trade.psychology.preMood] : '-' },
                        ].map((d) => (
                          <div key={d.label}>
                            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver">{d.label}</p>
                            <p className="text-xs sm:text-sm font-mono font-semibold text-brand-text mt-0.5">{d.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Trade Chart */}
                      <div className="mt-4">
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

                      {trade.psychology?.reflectionText && (
                        <div className="mt-4 p-3 sm:p-4 rounded-xl bg-brand-space/50 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-3.5 h-3.5 text-brand-violet" />
                            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-violet font-semibold">Reflection</p>
                          </div>
                          <p className="text-xs sm:text-sm text-brand-silver leading-relaxed">{trade.psychology.reflectionText}</p>
                        </div>
                      )}

                      <div className="mt-3 flex justify-end gap-2">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); setEditTrade(trade) }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-cyan/10 text-brand-cyan text-[10px] sm:text-xs hover:bg-brand-cyan/20 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); setShareTrade(trade) }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-violet/10 text-brand-violet text-[10px] sm:text-xs hover:bg-brand-violet/20 transition-colors">
                          <Share2 className="w-3 h-3" /> Share
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); handleDelete(trade.id) }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-loss/10 text-brand-loss text-[10px] sm:text-xs hover:bg-brand-loss/20 transition-colors">
                          <Trash2 className="w-3 h-3" /> Delete
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* New Trade Modal */}
      <AnimatePresence>
        {showNewTrade && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowNewTrade(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl my-4 sm:my-0 glass-card p-5 sm:p-6 border border-white/10">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-brand-text">Log New Trade</h2>
                  <p className="text-[10px] sm:text-xs text-brand-silver mt-1">Every detail matters. Be honest.</p>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowNewTrade(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-silver hover:text-brand-text"><X className="w-4 h-4" /></motion.button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Pair</label>
                    <select value={form.pair} onChange={(e) => updateForm('pair', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors">
                      {pairsList.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Direction</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => updateForm('direction', 'LONG')} className={`py-3 rounded-xl text-sm font-semibold transition-colors ${form.direction === 'LONG' ? 'bg-brand-profit/20 text-brand-profit border border-brand-profit/30' : 'bg-white/5 text-brand-silver border border-white/10'}`}>LONG ↑</button>
                      <button onClick={() => updateForm('direction', 'SHORT')} className={`py-3 rounded-xl text-sm font-semibold transition-colors ${form.direction === 'SHORT' ? 'bg-brand-loss/20 text-brand-loss border border-brand-loss/30' : 'bg-white/5 text-brand-silver border border-white/10'}`}>SHORT ↓</button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[{ label: 'Entry Price *', field: 'entryPrice' }, { label: 'Exit Price', field: 'exitPrice' }, { label: 'Stop Loss', field: 'stopLoss' }, { label: 'Take Profit', field: 'takeProfit' }].map((f) => (
                    <div key={f.field}>
                      <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">{f.label}</label>
                      <input type="number" step="0.00001" placeholder="0.00000" value={(form as any)[f.field]} onChange={(e) => updateForm(f.field, e.target.value)}
                        className="w-full px-3 sm:px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Lot Size *</label>
                    <input type="number" step="0.01" placeholder="0.10" value={form.lotSize} onChange={(e) => updateForm('lotSize', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Risk %</label>
                    <input type="number" step="0.1" placeholder="1.0" value={form.riskPercent} onChange={(e) => updateForm('riskPercent', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Entry Time *</label>
                    <input type="datetime-local" value={form.entryTime} onChange={(e) => updateForm('entryTime', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Exit Time</label>
                    <input type="datetime-local" value={form.exitTime} onChange={(e) => updateForm('exitTime', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                  </div>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <p className="text-xs font-display font-semibold text-brand-violet mb-3 flex items-center gap-2"><Brain className="w-4 h-4" /> Psychology Check-In</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[{ label: 'Mood', field: 'preMood' }, { label: 'Confidence', field: 'preConfidence' }, { label: 'Energy', field: 'preEnergy' }, { label: 'Focus', field: 'preFocus' }].map((psych) => (
                    <div key={psych.field}>
                      <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">{psych.label}</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} onClick={() => updateForm(psych.field, n)} className={`flex-1 py-2 rounded-lg text-xs font-mono transition-colors border ${(form as any)[psych.field] === n ? 'bg-brand-violet/20 text-brand-violet border-brand-violet/30' : 'bg-white/5 text-brand-silver border-transparent hover:bg-brand-violet/10'}`}>{n}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button onClick={() => updateForm('revengeFlag', !form.revengeFlag)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${form.revengeFlag ? 'bg-brand-loss/15 text-brand-loss border-brand-loss/30' : 'bg-white/5 text-brand-silver border-white/10'}`}>
                    <AlertTriangle className="w-3.5 h-3.5" /> Revenge Trade
                  </button>
                  <button onClick={() => updateForm('fomoFlag', !form.fomoFlag)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${form.fomoFlag ? 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30' : 'bg-white/5 text-brand-silver border-white/10'}`}>
                    <Flame className="w-3.5 h-3.5" /> FOMO Entry
                  </button>
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-[9px] uppercase tracking-wider text-brand-silver mr-1">Grade:</span>
                    {['A', 'B', 'C', 'D', 'F'].map((g) => (
                      <button key={g} onClick={() => updateForm('grade', form.grade === g ? '' : g)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors border ${form.grade === g ? gradeColors[g] : 'bg-white/5 text-brand-silver border-transparent'}`}>{g}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Trade Reflection</label>
                  <textarea rows={3} value={form.reflectionText} onChange={(e) => updateForm('reflectionText', e.target.value)} placeholder="What went well? What would you do differently?"
                    className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30 transition-colors resize-none" />
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet text-sm font-display font-bold text-brand-space shadow-lg shadow-brand-cyan/20 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log Trade'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Card Modal */}
      {editTrade && (
        <EditTradeModal trade={editTrade} open={!!editTrade} onClose={() => setEditTrade(null)} />
      )}

      {shareTrade && (
        <ShareCard trade={shareTrade} open={!!shareTrade} onClose={() => setShareTrade(null)} />
      )}
    </div>
  )
}








