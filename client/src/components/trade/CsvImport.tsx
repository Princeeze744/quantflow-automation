import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react'
import api from '../../services/api'
import { useTradeStore } from '../../stores/tradeStore'
import toast from 'react-hot-toast'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CsvImport({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [source, setSource] = useState('MT4')
  const [preview, setPreview] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; total: number; errors: string[] } | null>(null)
  const { fetchTrades, fetchAnalytics } = useTradeStore()

  const parseCsv = (text: string) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''))

    return lines.slice(1).map((line) => {
      const vals = line.split(',').map((v) => v.trim().replace(/['"]/g, ''))
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = vals[i] || '' })
      return row
    })
  }

  const mapToTrade = (row: Record<string, string>) => {
    // Try to auto-detect columns
    const pair = row['symbol'] || row['pair'] || row['instrument'] || row['currency pair'] || ''
    const type = (row['type'] || row['direction'] || row['side'] || '').toUpperCase()
    const direction = type.includes('BUY') || type.includes('LONG') ? 'LONG' : 'SHORT'
    const entryPrice = parseFloat(row['open price'] || row['entry price'] || row['entry'] || row['openprice'] || '0')
    const exitPrice = parseFloat(row['close price'] || row['exit price'] || row['exit'] || row['closeprice'] || '0')
    const lotSize = parseFloat(row['volume'] || row['lot size'] || row['lots'] || row['size'] || '0') 
    const sl = parseFloat(row['s/l'] || row['stop loss'] || row['sl'] || row['stoploss'] || '0')
    const tp = parseFloat(row['t/p'] || row['take profit'] || row['tp'] || row['takeprofit'] || '0')
    const commission = parseFloat(row['commission'] || '0')
    const swap = parseFloat(row['swap'] || '0')
    const entryTime = row['open time'] || row['entry time'] || row['opentime'] || row['open date'] || ''
    const exitTime = row['close time'] || row['exit time'] || row['closetime'] || row['close date'] || ''

    // MT4 volume is in mini lots (0.01 = micro), normalize
    const normalizedLot = lotSize > 10 ? lotSize / 100 : lotSize

    return {
      pair: pair.replace(/[^A-Z/]/gi, '').toUpperCase(),
      direction,
      entryPrice,
      exitPrice,
      stopLoss: sl || undefined,
      takeProfit: tp || undefined,
      lotSize: normalizedLot,
      commission: Math.abs(commission),
      swap,
      entryTime,
      exitTime,
    }
  }

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseCsv(text)
      const mapped = rows.map(mapToTrade).filter((t) => t.pair && t.entryPrice > 0 && t.exitPrice > 0)
      setPreview(mapped)
    }
    reader.readAsText(f)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.txt'))) {
      handleFile(f)
    }
  }, [handleFile])

  const handleImport = async () => {
    if (preview.length === 0) return
    setImporting(true)
    try {
      const res = await api.post('/import/csv', { trades: preview, source })
      setResult(res.data)
      if (res.data.imported > 0) {
        toast.success(`Imported ${res.data.imported} trades!`)
        fetchTrades()
        fetchAnalytics()
      }
    } catch {
      toast.error('Import failed')
    }
    setImporting(false)
  }

  const reset = () => {
    setFile(null)
    setPreview([])
    setResult(null)
  }

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl my-4 glass-card p-5 sm:p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-brand-text">Import Trades</h2>
            <p className="text-[10px] sm:text-xs text-brand-silver mt-1">Upload your MT4/MT5/cTrader CSV export</p>
          </div>
          <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-silver hover:text-brand-text">
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Source Selector */}
        <div className="mb-4">
          <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-silver mb-1.5 block">Source Platform</label>
          <div className="flex gap-2">
            {['MT4', 'MT5', 'cTrader'].map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors border ${
                  source === s
                    ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30'
                    : 'bg-white/5 text-brand-silver border-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Drop Zone */}
        {!file && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-white/10 rounded-xl p-8 sm:p-12 text-center hover:border-brand-cyan/30 transition-colors cursor-pointer"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.csv,.txt'
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0]
                if (f) handleFile(f)
              }
              input.click()
            }}
          >
            <Upload className="w-10 h-10 text-brand-silver/30 mx-auto mb-3" />
            <p className="text-sm text-brand-silver">Drop your CSV file here or click to browse</p>
            <p className="text-[10px] text-brand-silver/50 mt-2">
              Export from {source}: File → Account History → Right-click → Save as Report
            </p>
          </div>
        )}

        {/* Preview */}
        {file && !result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20">
              <FileText className="w-5 h-5 text-brand-cyan" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-brand-text">{file.name}</p>
                <p className="text-[10px] text-brand-silver">{preview.length} trades detected</p>
              </div>
              <button onClick={reset} className="text-brand-silver hover:text-brand-loss text-xs">Change</button>
            </div>

            {/* Preview Table */}
            {preview.length > 0 && (
              <div className="overflow-x-auto -mx-5 px-5">
                <div className="min-w-[500px]">
                  <div className="grid grid-cols-6 gap-2 px-3 py-2 text-[8px] sm:text-[9px] uppercase tracking-wider text-brand-silver/60">
                    <span>Pair</span>
                    <span>Direction</span>
                    <span>Entry</span>
                    <span>Exit</span>
                    <span>Lots</span>
                    <span>Time</span>
                  </div>
                  {preview.slice(0, 5).map((t, i) => (
                    <div key={i} className="grid grid-cols-6 gap-2 px-3 py-2 text-[10px] sm:text-xs font-mono rounded-lg hover:bg-white/[0.02]">
                      <span className="text-brand-text">{t.pair}</span>
                      <span className={t.direction === 'LONG' ? 'text-brand-profit' : 'text-brand-loss'}>{t.direction}</span>
                      <span className="text-brand-silver">{t.entryPrice}</span>
                      <span className="text-brand-silver">{t.exitPrice}</span>
                      <span className="text-brand-silver">{t.lotSize}</span>
                      <span className="text-brand-silver truncate">{t.entryTime?.split(' ')[0]}</span>
                    </div>
                  ))}
                  {preview.length > 5 && (
                    <p className="text-[10px] text-brand-silver/50 px-3 py-2">...and {preview.length - 5} more trades</p>
                  )}
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImport}
              disabled={importing || preview.length === 0}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet text-sm font-display font-bold text-brand-space shadow-lg shadow-brand-cyan/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {importing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Importing...</>
              ) : (
                <>Import {preview.length} Trades</>
              )}
            </motion.button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${result.imported > 0 ? 'bg-brand-profit/10 border border-brand-profit/20' : 'bg-brand-loss/10 border border-brand-loss/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.imported > 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-brand-profit" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-brand-loss" />
                )}
                <p className="text-sm font-semibold text-brand-text">
                  {result.imported > 0 ? `Successfully imported ${result.imported} of ${result.total} trades!` : 'Import failed'}
                </p>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {result.errors.slice(0, 3).map((err, i) => (
                    <p key={i} className="text-[10px] text-brand-loss">{err}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 py-3 rounded-xl bg-white/5 text-sm text-brand-silver hover:bg-white/10 transition-colors">
                Import More
              </button>
              <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-brand-cyan/15 text-sm text-brand-cyan hover:bg-brand-cyan/20 transition-colors">
                Done
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
