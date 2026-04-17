import { create } from 'zustand'
import api from '../services/api'

export interface Trade {
  id: string
  pair: string
  direction: string
  entryPrice: number
  exitPrice: number | null
  stopLoss: number | null
  takeProfit: number | null
  lotSize: number
  pnlDollars: number | null
  pnlPips: number | null
  rrActual: number | null
  riskPercent: number | null
  holdDurationMin: number | null
  session: string | null
  entryTime: string
  exitTime: string | null
  status: string
  source: string
  psychology: {
    preMood: number
    preConfidence: number
    preEnergy: number
    preFocus: number
    postEmotion: string | null
    revengeFlag: boolean
    fomoFlag: boolean
    reflectionText: string | null
    grade: string | null
  } | null
  tradeTags: Array<{ tag: { id: string; name: string; color: string; category: string } }>
}

export interface Analytics {
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  totalPnl: number
  avgRR: number
  profitFactor: number
  expectancy: number
  maxDrawdown: number
  avgHoldTime: number
  bestTrade: { pair: string; pnl: number } | null
  worstTrade: { pair: string; pnl: number } | null
  currentStreak: number
  longestWinStreak: number
  longestLossStreak: number
  byPair: Array<{ pair: string; trades: number; winRate: number; pnl: number }>
  bySession: Array<{ session: string; trades: number; winRate: number; pnl: number }>
  equityCurve: Array<{ date: string; balance: number }>
  pnlCalendar: Array<{ date: string; pnl: number }>
}

interface TradeState {
  trades: Trade[]
  analytics: Analytics | null
  tags: Array<{ id: string; name: string; color: string; category: string }>
  isLoading: boolean
  fetchTrades: (filters?: Record<string, string>) => Promise<void>
  fetchAnalytics: () => Promise<void>
  fetchTags: () => Promise<void>
  createTrade: (data: any) => Promise<boolean>
  deleteTrade: (id: string) => Promise<boolean>
}

export const useTradeStore = create<TradeState>((set, get) => ({
  trades: [],
  analytics: null,
  tags: [],
  isLoading: false,

  fetchTrades: async (filters) => {
    set({ isLoading: true })
    try {
      const params = new URLSearchParams(filters)
      const res = await api.get(`/trades?${params}`)
      set({ trades: res.data.trades, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchAnalytics: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get('/analytics/overview')
      set({ analytics: res.data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchTags: async () => {
    try {
      const res = await api.get('/trades/tags/all')
      set({ tags: res.data.tags })
    } catch {
      // silent fail
    }
  },

  createTrade: async (data) => {
    try {
      await api.post('/trades', data)
      await get().fetchTrades()
      await get().fetchAnalytics()
      return true
    } catch {
      return false
    }
  },

  deleteTrade: async (id) => {
    try {
      await api.delete(`/trades/${id}`)
      await get().fetchTrades()
      await get().fetchAnalytics()
      return true
    } catch {
      return false
    }
  },
}))
