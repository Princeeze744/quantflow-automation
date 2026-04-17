import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  Flame,
  Calendar,
  BarChart3,
  ChevronRight,
  Zap,
  BookOpen,
  ArrowUpRight,
} from 'lucide-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
}

// Mock AI conversation
const mockMessages: Array<{ role: 'assistant' | 'user'; content: string; time: string }> = [
  {
    role: 'assistant' as const,
    content: "Good morning! I've analyzed your recent trading activity. You had a strong week with 67% win rate across 12 trades. Your pullback setups on EUR/USD continue to outperform — 78% win rate this month. However, I noticed 2 revenge trades on GBP/JPY that cost you $168. Let's work on that pattern today.",
    time: '8:00 AM',
  },
]

const quickPrompts = [
  { label: 'Review my week', icon: Calendar },
  { label: "What's my best setup?", icon: Target },
  { label: 'Am I overtrading?', icon: AlertTriangle },
  { label: 'Grade my last trade', icon: BarChart3 },
]

// Trade insights cards
const insights = [
  {
    type: 'strength',
    icon: TrendingUp,
    title: 'Your Edge: EUR/USD Pullbacks',
    description: '78% win rate, 2.1 avg R:R on pullback entries during NY session. This is your bread and butter.',
    color: 'text-brand-profit',
    bg: 'bg-brand-profit/10',
    border: 'border-brand-profit/20',
  },
  {
    type: 'warning',
    icon: AlertTriangle,
    title: 'Pattern Alert: Revenge Trading',
    description: '3 revenge trades this month, all on GBP/JPY after losses. Combined cost: -$234. Consider a 30-min cooldown rule.',
    color: 'text-brand-loss',
    bg: 'bg-brand-loss/10',
    border: 'border-brand-loss/20',
  },
  {
    type: 'insight',
    icon: Sparkles,
    title: 'Optimal Window: 14:00 - 17:00 UTC',
    description: 'Your trades during London-NY overlap have 72% win rate vs 54% outside this window. Focus your energy here.',
    color: 'text-brand-violet',
    bg: 'bg-brand-violet/10',
    border: 'border-brand-violet/20',
  },
  {
    type: 'improvement',
    icon: Target,
    title: 'TP Management Opportunity',
    description: 'You exit 40% of winners before TP. If you held to target, monthly P&L would increase by estimated 35%.',
    color: 'text-brand-cyan',
    bg: 'bg-brand-cyan/10',
    border: 'border-brand-cyan/20',
  },
]

const weeklyReport = {
  trades: 12,
  wins: 8,
  losses: 4,
  pnl: 769.0,
  bestTrade: '+$312.00 (USD/CHF)',
  worstTrade: '-$126.00 (GBP/JPY)',
  avgRR: '1.76R',
  discipline: '91%',
  grade: 'B+',
}

export default function AiCoach() {
  const [messages, setMessages] = useState(mockMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'review'>('insights')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    setMessages((prev) => [
      ...prev,
      { role:'user' as const, content: input, time: 'Just now' },
    ])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          content:
            "Based on your trading data, I can see a clear pattern. Your best performance comes from pullback setups during high-volume sessions. I'd recommend focusing on EUR/USD and USD/CHF for the next week, and setting a strict 2-trade maximum on GBP/JPY until we rebuild confidence on that pair.",
          time: 'Just now',
        },
      ])
      setIsTyping(false)
    }, 2000)
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
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">
              <span className="text-brand-text">AI Trading </span>
              <span className="text-gradient">Coach</span>
            </h1>
            <p className="text-xs sm:text-sm text-brand-silver mt-1">
              Your personal mentor — powered by your data.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card border-brand-violet/20">
            <div className="w-2 h-2 rounded-full bg-brand-violet animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono text-brand-violet">AI Active</span>
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div variants={item} className="flex gap-1 p-1 rounded-xl bg-brand-obsidian/80 border border-white/5 w-fit">
          {[
            { id: 'insights', label: 'Insights', icon: Sparkles },
            { id: 'chat', label: 'Ask Coach', icon: Brain },
            { id: 'review', label: 'Weekly Review', icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-violet/20 text-brand-violet'
                  : 'text-brand-silver hover:text-brand-text'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </motion.div>

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Daily Briefing */}
            <motion.div variants={item} className="glass-card p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-violet/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-cyan/5 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-violet to-brand-cyan flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-display font-bold text-brand-text">Daily Briefing</h2>
                    <p className="text-[9px] sm:text-[10px] text-brand-silver">April 15, 2026 · Generated at 8:00 AM</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                  <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-[9px] uppercase tracking-wider text-brand-cyan font-semibold mb-1">Market Bias</p>
                    <p className="text-xs sm:text-sm text-brand-text">USD slightly bullish. EUR under pressure from ECB dovish signals. Focus on USD longs.</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-[9px] uppercase tracking-wider text-brand-profit font-semibold mb-1">Your Focus Today</p>
                    <p className="text-xs sm:text-sm text-brand-text">EUR/USD pullback shorts during NY session. Max 2 trades. Risk 1% per trade.</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-[9px] uppercase tracking-wider text-yellow-400 font-semibold mb-1">Watch Out</p>
                    <p className="text-xs sm:text-sm text-brand-text">FOMC minutes at 2PM EST. Avoid new entries 30 min before. You lost $340 last FOMC.</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <p className="text-[9px] sm:text-[10px] text-brand-silver flex items-center gap-1">
                    <Flame className="w-3 h-3 text-brand-violet" />
                    Analysis powered by Trade2Retire Academy AI
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {insights.map((insight, i) => (
                <motion.div
                  key={insight.title}
                  variants={item}
                  whileHover={{ y: -3 }}
                  className={`glass-card-hover p-4 sm:p-5 border ${insight.border} cursor-pointer group`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${insight.bg} flex items-center justify-center flex-shrink-0`}>
                      <insight.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${insight.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xs sm:text-sm font-display font-semibold ${insight.color}`}>
                        {insight.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-brand-silver mt-1 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-silver/30 group-hover:text-brand-silver transition-colors flex-shrink-0 mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card flex flex-col"
            style={{ height: 'calc(100vh - 220px)' }}
          >
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[75%] ${
                    msg.role === 'user'
                      ? 'bg-brand-cyan/15 border border-brand-cyan/20 rounded-2xl rounded-br-md'
                      : 'bg-white/[0.03] border border-white/5 rounded-2xl rounded-bl-md'
                  } p-3 sm:p-4`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-violet to-brand-cyan flex items-center justify-center">
                          <Brain className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[9px] font-semibold text-brand-violet">QUANTFLOW AI</span>
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-brand-text leading-relaxed">{msg.content}</p>
                    <p className="text-[9px] text-brand-silver/50 mt-2">{msg.time}</p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-bl-md p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-violet to-brand-cyan flex items-center justify-center">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[9px] font-semibold text-brand-violet">QUANTFLOW AI</span>
                    </div>
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-brand-violet" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-brand-violet" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-brand-violet" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 sm:px-6 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {quickPrompts.map((prompt) => (
                <motion.button
                  key={prompt.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInput(prompt.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-[10px] sm:text-xs text-brand-silver hover:text-brand-text hover:bg-white/10 transition-all whitespace-nowrap border border-white/5 flex-shrink-0"
                >
                  <prompt.icon className="w-3 h-3" />
                  {prompt.label}
                </motion.button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-white/5">
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your AI coach anything..."
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-space border border-white/10 text-sm text-brand-text placeholder-brand-silver/40 focus:outline-none focus:border-brand-violet/30 focus:ring-1 focus:ring-brand-violet/20 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-violet/20"
                >
                  <Send className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* WEEKLY REVIEW TAB */}
        {activeTab === 'review' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Report Header */}
            <motion.div variants={item} className="glass-card p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-cyan/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-brand-cyan font-semibold">Weekly Performance Review</p>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-brand-text mt-1">April 7 — 13, 2026</h2>
                  <p className="text-xs text-brand-silver mt-1">Auto-generated by Quantflow AI</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-wider text-brand-silver">Overall Grade</p>
                    <p className="text-3xl sm:text-4xl font-display font-bold text-brand-profit mt-1">{weeklyReport.grade}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Trades', value: weeklyReport.trades.toString(), color: 'text-brand-text' },
                { label: 'Win/Loss', value: `${weeklyReport.wins}W / ${weeklyReport.losses}L`, color: 'text-brand-profit' },
                { label: 'Net P&L', value: `+$${weeklyReport.pnl}`, color: 'text-brand-profit' },
                { label: 'Discipline', value: weeklyReport.discipline, color: 'text-brand-cyan' },
              ].map((s) => (
                <motion.div key={s.label} variants={item} className="glass-card p-3 sm:p-4 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-brand-silver">{s.label}</p>
                  <p className={`text-lg sm:text-xl font-mono font-bold ${s.color} mt-1`}>{s.value}</p>
                </motion.div>
              ))}
            </div>

            {/* AI Commentary */}
            <motion.div variants={item} className="glass-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-brand-violet" />
                <h3 className="text-sm font-display font-semibold text-brand-text">AI Commentary</h3>
              </div>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle2, color: 'text-brand-profit', text: 'Strong week overall. Your patience on EUR/USD pullbacks paid off with 3 clean winners averaging +1.9R.' },
                  { icon: AlertTriangle, color: 'text-brand-loss', text: 'Two revenge trades on GBP/JPY after Monday\'s loss cost you $168. This pattern has appeared 3 of the last 4 weeks.' },
                  { icon: Sparkles, color: 'text-brand-violet', text: 'Your London-NY overlap trades had 83% win rate this week. Consider increasing position size slightly during this window.' },
                  { icon: Target, color: 'text-brand-cyan', text: 'Next week focus: Stick to max 3 trades per day, avoid GBP/JPY until review is complete, trail stops on EUR/USD winners.' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02]"
                  >
                    <item.icon className={`w-4 h-4 ${item.color} mt-0.5 flex-shrink-0`} />
                    <p className="text-xs sm:text-sm text-brand-silver leading-relaxed">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-[9px] text-brand-silver flex items-center gap-1">
                  <Flame className="w-3 h-3 text-brand-violet" />
                  Weekly review powered by Trade2Retire Academy AI
                </p>
              </div>
            </motion.div>

            {/* Export Button */}
            <motion.div variants={item} className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan text-sm font-display font-semibold text-white shadow-lg shadow-brand-violet/20"
              >
                <ArrowUpRight className="w-4 h-4" />
                Export as PDF Report
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}





