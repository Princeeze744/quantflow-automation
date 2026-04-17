import { motion } from 'framer-motion'
import { Newspaper, ExternalLink, Clock } from 'lucide-react'

const news = [
  {
    title: 'Fed Signals Patience on Rate Cuts Amid Sticky Inflation',
    source: 'Reuters',
    time: '32m ago',
    impact: 'high',
    currencies: ['USD'],
  },
  {
    title: 'ECB Lagarde: More Data Needed Before June Decision',
    source: 'Bloomberg',
    time: '1h ago',
    impact: 'high',
    currencies: ['EUR'],
  },
  {
    title: 'UK Employment Beats Expectations, GBP Rallies',
    source: 'FT',
    time: '2h ago',
    impact: 'medium',
    currencies: ['GBP'],
  },
  {
    title: 'Japan CPI Comes in Below Forecast, Yen Weakens',
    source: 'Nikkei',
    time: '4h ago',
    impact: 'medium',
    currencies: ['JPY'],
  },
  {
    title: 'RBA Minutes Show Board Split on Next Move',
    source: 'AFR',
    time: '6h ago',
    impact: 'medium',
    currencies: ['AUD'],
  },
  {
    title: 'Oil Prices Surge on Middle East Supply Concerns',
    source: 'CNBC',
    time: '7h ago',
    impact: 'low',
    currencies: ['CAD', 'USD'],
  },
]

const impactDot: Record<string, string> = {
  high: 'bg-brand-loss',
  medium: 'bg-yellow-400',
  low: 'bg-brand-profit',
}

export default function NewsFeed() {
  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
            <Newspaper className="w-4 h-4 text-brand-cyan" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-display font-semibold text-brand-text">Market News</h3>
            <p className="text-[9px] sm:text-[10px] text-brand-silver">Stay informed, trade prepared</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-cyan/10">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
          <span className="text-[9px] font-mono text-brand-cyan">LIVE</span>
        </div>
      </div>

      <div className="space-y-2">
        {news.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full ${impactDot[item.impact]} mt-1.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-xs text-brand-text font-medium leading-relaxed group-hover:text-brand-cyan transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[9px] text-brand-silver">{item.source}</span>
                  <span className="text-[9px] text-brand-silver/30">·</span>
                  <span className="text-[9px] text-brand-silver flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />{item.time}
                  </span>
                  <span className="text-[9px] text-brand-silver/30">·</span>
                  {item.currencies.map((c) => (
                    <span key={c} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-brand-silver font-mono">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-brand-silver/20 group-hover:text-brand-cyan/50 transition-colors flex-shrink-0 mt-1" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
