import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Brain, AlertTriangle, Flame, Loader2 } from 'lucide-react'
import { instruments } from '../../utils/instruments'
import api from '../../services/api'
import { useTradeStore, Trade } from '../../stores/tradeStore'
import toast from 'react-hot-toast'

const pairsList = instruments.map((i) => i.symbol)
const gradeColors: Record<string, string> = {
  A: 'text-brand-profit bg-brand-profit/10 border-brand-profit/20',
  B: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20',
  C: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  D: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  F: 'text-brand-loss bg-brand-loss/10 border-brand-loss/20',
}

interface Props {
  trade: Trade | null
  open: boolean
  onClose: () => void
}

export default function EditTradeModal({ trade, open, onClose }: Props) {
  const { fetchTrades, fetchAnalytics } = useTradeStore()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    pair: '', direction: 'LONG', entryPrice: '', exitPrice: '', stopLoss: '', takeProfit: '',
    lotSize: '', riskPercent: '', entryTime: '', exitTime: '',
    preMood: 3, preConfidence: 3, preEnergy: 3, preFocus: 3,
    revengeFlag: false, fomoFlag: false, reflectionText: '', grade: '',
  })

  useEffect(() => {
    if (trade) {
      const toLocalDT = (d: string | null) => {
        if (!d) return ''
        const dt = new Date(d)
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
      }
      setForm({
        pair: trade.pair,
        direction: trade.direction,
        entryPrice: trade.entryPrice?.toString() || '',
        exitPrice: trade.exitPrice?.toString() || '',
        stopLoss: trade.stopLoss?.toString() || '',
        takeProfit: trade.takeProfit?.toString() || '',
        lotSize: trade.lotSize?.toString() || '',
        riskPercent: trade.riskPercent?.toString() || '',
        entryTime: toLocalDT(trade.entryTime),
        exitTime: toLocalDT(trade.exitTime),
        preMood: trade.psychology?.preMood || 3,
        preConfidence: trade.psychology?.preConfidence || 3,
        preEnergy: trade.psychology?.preEnergy || 3,
        preFocus: trade.psychology?.preFocus || 3,
        revengeFlag: trade.psychology?.revengeFlag || false,
        fomoFlag: trade.psychology?.fomoFlag || false,
        reflectionText: trade.psychology?.reflectionText || '',
        grade: trade.psychology?.grade || '',
      })
    }
  }, [trade])

  if (!trade || !open) return null

  const updateForm = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.pair || !form.entryPrice || !form.lotSize || !form.entryTime) {
      toast.error('Pair, entry price, lot size, and entry time required')
      return
    }
    setSubmitting(true)

    try {
      // Recalculate P&L
      const entry = parseFloat(form.entryPrice)
      const exit = form.exitPrice ? parseFloat(form.exitPrice) : null
      const stopLoss = form.stopLoss ? parseFloat(form.stopLoss) : null
      const lotSize = parseFloat(form.lotSize)

      let pnlPips = null
      let pnlDollars = null
      let rrActual = null
      let holdDurationMin = null

      if (exit && entry) {
        const pipMultiplier = form.pair.includes('JPY') ? 100 : 10000
        const rawPips = (exit - entry) * pipMultiplier
        pnlPips = form.direction === 'LONG' ? rawPips : -rawPips
        pnlDollars = pnlPips * lotSize * (form.pair.includes('JPY') ? 100 : 10)
      }

      if (stopLoss && entry && exit) {
        const slDistance = Math.abs(entry - stopLoss)
        const tradeDistance = Math.abs(exit - entry)
        if (slDistance > 0) {
          const rr = tradeDistance / slDistance
          rrActual = pnlDollars && pnlDollars >= 0 ? rr : -rr
        }
      }

      if (form.exitTime && form.entryTime) {
        holdDurationMin = Math.round((new Date(form.exitTime).getTime() - new Date(form.entryTime).getTime()) / 60000)
      }

      const entryHour = new Date(form.entryTime).getUTCHours()
      let session = 'LONDON'
      if (entryHour >= 21 || entryHour < 6) session = 'SYDNEY'
      else if (entryHour >= 0 && entryHour < 9) session = 'TOKYO'
      else if (entryHour >= 13 && entryHour < 16) session = 'OVERLAP'
      else if (entryHour >= 13 && entryHour < 22) session = 'NEWYORK'

      await api.put(`/trades/${trade.id}`, {
        pair: form.pair,
        direction: form.direction,
        entryPrice: entry,
        exitPrice: exit,
        stopLoss: stopLoss,
        takeProfit: form.takeProfit ? parseFloat(form.takeProfit) : null,
        lotSize: lotSize,
        riskPercent: form.riskPercent ? parseFloat(form.riskPercent) : null,
        entryTime: new Date(form.entryTime),
        exitTime: form.exitTime ? new Date(form.exitTime) : null,
        pnlDollars,
        pnlPips,
        rrActual,
        holdDurationMin,
        session,
        status: exit ? 'CLOSED' : 'OPEN',
      })

      // Update psychology separately if exists
      if (trade.psychology) {
        await api.put(`/trades/${trade.id}/psychology`, {
          preMood: form.preMood,
          preConfidence: form.preConfidence,
          preEnergy: form.preEnergy,
          preFocus: form.preFocus,
          revengeFlag: form.revengeFlag,
          fomoFlag: form.fomoFlag,
          reflectionText: form.reflectionText || null,
          grade: form.grade || null,
        }).catch(() => {})
      }

      toast.success('Trade updated!')
      await fetchTrades()
      await fetchAnalytics()
      onClose()
    } catch {
      toast.error('Failed to update trade')
    }
    setSubmitting(false)
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl my-4 glass-card p-5 sm:p-6 border border-white/10">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-brand-text">Edit Trade</h2>
              <p className="text-[10px] sm:text-xs text-brand-silver mt-1">Update trade details — P&L recalculates automatically.</p>
            </div>
            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-silver hover:text-brand-text">
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Pair</label>
                <select value={form.pair} onChange={(e) => updateForm('pair', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors">
                  {pairsList.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => updateForm('direction', 'LONG')} className={`py-3 rounded-xl text-sm font-semibold transition-colors ${form.direction === 'LONG' ? 'bg-brand-profit/20 text-brand-profit border border-brand-profit/30' : 'bg-white/5 text-brand-silver border border-white/10'}`}>LONG ↑</button>
                  <button onClick={() => updateForm('direction', 'SHORT')} className={`py-3 rounded-xl text-sm font-semibold transition-colors ${form.direction === 'SHORT' ? 'bg-brand-loss/20 text-brand-loss border border-brand-loss/30' : 'bg-white/5 text-brand-silver border border-white/10'}`}>SHORT ↓</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[{ label: 'Entry Price *', field: 'entryPrice' }, { label: 'Exit Price', field: 'exitPrice' }, { label: 'Stop Loss', field: 'stopLoss' }, { label: 'Take Profit', field: 'takeProfit' }].map((f) => (
                <div key={f.field}>
                  <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">{f.label}</label>
                  <input type="number" step="0.00001" value={(form as any)[f.field]} onChange={(e) => updateForm(f.field, e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Lot Size *</label>
                <input type="number" step="0.01" value={form.lotSize} onChange={(e) => updateForm('lotSize', e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Risk %</label>
                <input type="number" step="0.1" value={form.riskPercent} onChange={(e) => updateForm('riskPercent', e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Entry Time *</label>
                <input type="datetime-local" value={form.entryTime} onChange={(e) => updateForm('entryTime', e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Exit Time</label>
                <input type="datetime-local" value={form.exitTime} onChange={(e) => updateForm('exitTime', e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="text-xs font-display font-semibold text-brand-violet mb-3 flex items-center gap-2"><Brain className="w-4 h-4" /> Psychology</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[{ label: 'Mood', field: 'preMood' }, { label: 'Confidence', field: 'preConfidence' }, { label: 'Energy', field: 'preEnergy' }, { label: 'Focus', field: 'preFocus' }].map((psych) => (
                <div key={psych.field}>
                  <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">{psych.label}</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => updateForm(psych.field, n)} className={`flex-1 py-2 rounded-lg text-xs font-mono transition-colors border ${(form as any)[psych.field] === n ? 'bg-brand-violet/20 text-brand-violet border-brand-violet/30' : 'bg-white/5 text-brand-silver border-transparent'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => updateForm('revengeFlag', !form.revengeFlag)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${form.revengeFlag ? 'bg-brand-loss/15 text-brand-loss border-brand-loss/30' : 'bg-white/5 text-brand-silver border-white/10'}`}>
                <AlertTriangle className="w-3.5 h-3.5" /> Revenge
              </button>
              <button onClick={() => updateForm('fomoFlag', !form.fomoFlag)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${form.fomoFlag ? 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30' : 'bg-white/5 text-brand-silver border-white/10'}`}>
                <Flame className="w-3.5 h-3.5" /> FOMO
              </button>
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-[9px] uppercase tracking-wider text-brand-silver mr-1">Grade:</span>
                {['A', 'B', 'C', 'D', 'F'].map((g) => (
                  <button key={g} onClick={() => updateForm('grade', form.grade === g ? '' : g)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors border ${form.grade === g ? gradeColors[g] : 'bg-white/5 text-brand-silver border-transparent'}`}>{g}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-wider text-brand-silver mb-1.5 block">Reflection</label>
              <textarea rows={3} value={form.reflectionText} onChange={(e) => updateForm('reflectionText', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors resize-none" />
            </div>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet text-sm font-display font-bold text-brand-space shadow-lg shadow-brand-cyan/20 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
