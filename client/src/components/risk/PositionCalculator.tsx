import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, DollarSign, Shield, AlertTriangle, Search, ChevronDown } from 'lucide-react'
import { instruments, getInstrument, calculatePositionSize, getCategories, getByCategory, type Instrument } from '../../utils/instruments'

export default function PositionCalculator() {
  const [balance, setBalance] = useState(10000)
  const [accountCurrency, setAccountCurrency] = useState('USD')
  const [riskPercent, setRiskPercent] = useState(1)
  const [riskMode, setRiskMode] = useState<'percent' | 'fixed'>('percent')
  const [fixedRisk, setFixedRisk] = useState(100)
  const [selectedSymbol, setSelectedSymbol] = useState('EUR/USD')
  const [slPips, setSlPips] = useState(30)
  const [tpPips, setTpPips] = useState(60)
  const [showPairPicker, setShowPairPicker] = useState(false)
  const [pairSearch, setPairSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('MAJOR')
  const [customSymbol, setCustomSymbol] = useState('')

  const instrument = getInstrument(selectedSymbol)

  const effectiveRiskPercent = riskMode === 'percent' ? riskPercent : (fixedRisk / balance) * 100

  const result = useMemo(() => {
    if (!instrument) return null
    return calculatePositionSize(instrument, balance, effectiveRiskPercent, slPips, accountCurrency)
  }, [instrument, balance, effectiveRiskPercent, slPips, accountCurrency])

  const potentialProfit = result && tpPips > 0 ? (result.pipValue / (result.lots || 1)) * result.lots * tpPips : 0
  const rrRatio = slPips > 0 ? tpPips / slPips : 0

  const filteredPairs = pairSearch
    ? instruments.filter((i) => i.symbol.toLowerCase().includes(pairSearch.toLowerCase()) || i.name.toLowerCase().includes(pairSearch.toLowerCase()))
    : getByCategory(activeCategory)

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
          <Calculator className="w-4 h-4 text-brand-cyan" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">Position Size Calculator</h3>
          <p className="text-[9px] sm:text-[10px] text-brand-silver">Professional-grade risk management</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Row 1: Account */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Account Balance</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/40" />
              <input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} className="w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Account Currency</label>
            <select value={accountCurrency} onChange={(e) => setAccountCurrency(e.target.value)} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors">
              {['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'ZAR', 'NGN'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Instrument Picker */}
        <div>
          <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Instrument</label>
          <button onClick={() => setShowPairPicker(!showPairPicker)} className="w-full flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text hover:border-brand-cyan/30 transition-colors">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold">{selectedSymbol}</span>
              {instrument && <span className="text-[10px] text-brand-silver">({instrument.name})</span>}
            </div>
            <ChevronDown className={`w-4 h-4 text-brand-silver transition-transform ${showPairPicker ? 'rotate-180' : ''}`} />
          </button>

          {showPairPicker && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-3 rounded-xl bg-brand-obsidian border border-white/10 max-h-64 overflow-hidden flex flex-col">
              {/* Search */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-silver/40" />
                <input type="text" value={pairSearch} onChange={(e) => setPairSearch(e.target.value)} placeholder="Search any symbol..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-brand-space border border-white/10 text-xs text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30" />
              </div>

              {/* Category tabs */}
              {!pairSearch && (
                <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                  {getCategories().map((cat) => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-2 py-1 rounded-lg text-[9px] font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-brand-cyan/15 text-brand-cyan' : 'text-brand-silver hover:text-brand-text'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Pair list */}
              <div className="overflow-y-auto space-y-0.5 flex-1">
                {filteredPairs.map((inst) => (
                  <button key={inst.symbol} onClick={() => { setSelectedSymbol(inst.symbol); setShowPairPicker(false); setPairSearch('') }} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition-colors ${selectedSymbol === inst.symbol ? 'bg-brand-cyan/10 text-brand-cyan' : 'text-brand-text'}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">{inst.symbol}</span>
                      <span className="text-[9px] text-brand-silver hidden sm:inline">{inst.name}</span>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-brand-silver">{inst.category}</span>
                  </button>
                ))}
              </div>

              {/* Custom pair */}
              <div className="mt-2 pt-2 border-t border-white/5">
                <div className="flex gap-2">
                  <input type="text" value={customSymbol} onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())} placeholder="Custom: e.g. USD/ZAR" className="flex-1 px-3 py-1.5 rounded-lg bg-brand-space border border-white/10 text-[10px] font-mono text-brand-text placeholder-brand-silver/30 focus:outline-none focus:border-brand-cyan/30" />
                  <button onClick={() => { if (customSymbol) { setSelectedSymbol(customSymbol); setShowPairPicker(false); setCustomSymbol('') } }} className="px-3 py-1.5 rounded-lg bg-brand-cyan/15 text-brand-cyan text-[10px] font-medium">Use</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Risk Mode Toggle */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver">Risk</label>
            <div className="flex gap-1">
              <button onClick={() => setRiskMode('percent')} className={`px-2 py-0.5 rounded text-[9px] font-medium ${riskMode === 'percent' ? 'bg-brand-cyan/15 text-brand-cyan' : 'text-brand-silver'}`}>%</button>
              <button onClick={() => setRiskMode('fixed')} className={`px-2 py-0.5 rounded text-[9px] font-medium ${riskMode === 'fixed' ? 'bg-brand-cyan/15 text-brand-cyan' : 'text-brand-silver'}`}>$</button>
            </div>
          </div>
          {riskMode === 'percent' ? (
            <div>
              <input type="range" min={0.1} max={5} step={0.1} value={riskPercent} onChange={(e) => setRiskPercent(Number(e.target.value))} className="w-full accent-brand-cyan" />
              <div className="flex justify-between text-[9px] text-brand-silver mt-1">
                <span>0.1%</span>
                <span className={`font-mono font-bold ${riskPercent <= 1 ? 'text-brand-profit' : riskPercent <= 2 ? 'text-yellow-400' : 'text-brand-loss'}`}>{riskPercent.toFixed(1)}% = ${(balance * riskPercent / 100).toFixed(2)}</span>
                <span>5%</span>
              </div>
            </div>
          ) : (
            <input type="number" value={fixedRisk} onChange={(e) => setFixedRisk(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
          )}
        </div>

        {/* SL and TP */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Stop Loss (pips)</label>
            <input type="number" value={slPips} onChange={(e) => setSlPips(Number(e.target.value))} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
          </div>
          <div>
            <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Take Profit (pips)</label>
            <input type="number" value={tpPips} onChange={(e) => setTpPips(Number(e.target.value))} className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-brand-space border border-white/10 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-cyan/30 transition-colors" />
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3">
            {/* Primary result */}
            <motion.div animate={{ scale: [1, 1.01, 1] }} transition={{ duration: 3, repeat: Infinity }} className="p-4 rounded-xl bg-gradient-to-br from-brand-cyan/10 to-brand-violet/5 border border-brand-cyan/20 text-center">
              <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-brand-cyan mb-1">Recommended Position Size</p>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-brand-cyan">{result.lots.toFixed(2)}</p>
              <p className="text-[10px] text-brand-silver mt-1">
                Standard Lots · {result.units.toLocaleString()} units
              </p>
            </motion.div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] text-center">
                <p className="text-[7px] sm:text-[8px] uppercase tracking-wider text-brand-silver">Mini Lots</p>
                <p className="text-sm sm:text-base font-mono font-bold text-brand-text">{(result.lots * 10).toFixed(1)}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] text-center">
                <p className="text-[7px] sm:text-[8px] uppercase tracking-wider text-brand-silver">Micro Lots</p>
                <p className="text-sm sm:text-base font-mono font-bold text-brand-text">{(result.lots * 100).toFixed(0)}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] text-center">
                <p className="text-[7px] sm:text-[8px] uppercase tracking-wider text-brand-silver">Risk Amount</p>
                <p className="text-sm sm:text-base font-mono font-bold text-brand-loss">${result.riskAmount.toFixed(2)}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] text-center">
                <p className="text-[7px] sm:text-[8px] uppercase tracking-wider text-brand-silver">R:R Ratio</p>
                <p className={`text-sm sm:text-base font-mono font-bold ${rrRatio >= 1.5 ? 'text-brand-profit' : rrRatio >= 1 ? 'text-yellow-400' : 'text-brand-loss'}`}>1:{rrRatio.toFixed(1)}</p>
              </div>
            </div>

            {/* Potential P&L */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-brand-loss/5 border border-brand-loss/10 text-center">
                <p className="text-[8px] uppercase tracking-wider text-brand-loss mb-0.5">Potential Loss</p>
                <p className="text-lg font-mono font-bold text-brand-loss">-${result.riskAmount.toFixed(2)}</p>
                <p className="text-[9px] text-brand-silver">at {slPips} pip SL</p>
              </div>
              <div className="p-3 rounded-xl bg-brand-profit/5 border border-brand-profit/10 text-center">
                <p className="text-[8px] uppercase tracking-wider text-brand-profit mb-0.5">Potential Profit</p>
                <p className="text-lg font-mono font-bold text-brand-profit">+${potentialProfit.toFixed(2)}</p>
                <p className="text-[9px] text-brand-silver">at {tpPips} pip TP</p>
              </div>
            </div>

            {/* Instrument info */}
            {instrument && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[8px] uppercase text-brand-silver">Contract Size</p>
                    <p className="text-[11px] font-mono font-semibold text-brand-text">{instrument.contractSize.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase text-brand-silver">Pip Position</p>
                    <p className="text-[11px] font-mono font-semibold text-brand-text">{instrument.pipPosition} decimals</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase text-brand-silver">Pip Value/Lot</p>
                    <p className="text-[11px] font-mono font-semibold text-brand-text">${result.pipValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {effectiveRiskPercent > 2 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-brand-loss/10 border border-brand-loss/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-brand-loss flex-shrink-0" />
            <p className="text-[10px] sm:text-[11px] text-brand-loss">Risk above 2% per trade significantly increases your chance of ruin. Professional traders risk 0.5-1%.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
