import { create } from 'zustand'
import api from '../services/api'

export interface RiskSettings {
  maxRiskPerTrade: number
  dailyLossLimit: number
  weeklyLossLimit: number
  monthlyLossLimit: number
  maxDrawdownPercent: number
  maxOpenTrades: number
  maxTradesPerDay: number
  cooldownMinutes: number
  pauseOnDailyLimit: boolean
  flagRevengeTrades: boolean
  reduceOnDrawdown: boolean
}

export interface TradingRule {
  id: string
  text: string
  category: string
  isActive: boolean
}

export interface UserProfile {
  displayName: string
  broker: string
  accountCurrency: string
  startingBalance: number
  timezone: string
}

interface SettingsState {
  profile: UserProfile | null
  riskSettings: RiskSettings | null
  rules: TradingRule[]
  isLoading: boolean
  fetchSettings: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>
  updateRisk: (data: Partial<RiskSettings>) => Promise<boolean>
  addRule: (text: string) => Promise<boolean>
  deleteRule: (id: string) => Promise<boolean>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  profile: null,
  riskSettings: null,
  rules: [],
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get('/settings')
      set({
        profile: res.data.user,
        riskSettings: res.data.riskSettings,
        rules: res.data.rules || [],
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  updateProfile: async (data) => {
    try {
      await api.put('/settings/profile', data)
      await get().fetchSettings()
      return true
    } catch {
      return false
    }
  },

  updateRisk: async (data) => {
    try {
      await api.put('/settings/risk', data)
      await get().fetchSettings()
      return true
    } catch {
      return false
    }
  },

  addRule: async (text) => {
    try {
      await api.post('/settings/rules', { text, category: 'PRE_TRADE' })
      await get().fetchSettings()
      return true
    } catch {
      return false
    }
  },

  deleteRule: async (id) => {
    try {
      await api.delete(`/settings/rules/${id}`)
      await get().fetchSettings()
      return true
    } catch {
      return false
    }
  },
}))
