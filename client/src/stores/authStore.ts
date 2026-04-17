import { create } from 'zustand'
import api from '../services/api'

interface User {
  id: string
  email: string
  displayName: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, displayName: string) => Promise<boolean>
  logout: () => void
  loadUser: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('qf_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token, user } = res.data
      localStorage.setItem('qf_token', token)
      localStorage.setItem('qf_user', JSON.stringify(user))
      set({ user, token, isLoading: false })
      return true
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Login failed', isLoading: false })
      return false
    }
  },

  register: async (email, password, displayName) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post('/auth/register', { email, password, displayName })
      const { token, user } = res.data
      localStorage.setItem('qf_token', token)
      localStorage.setItem('qf_user', JSON.stringify(user))
      set({ user, token, isLoading: false })
      return true
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Registration failed', isLoading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('qf_token')
    localStorage.removeItem('qf_user')
    set({ user: null, token: null })
  },

  loadUser: () => {
    const saved = localStorage.getItem('qf_user')
    const token = localStorage.getItem('qf_token')
    if (saved && token) {
      set({ user: JSON.parse(saved), token })
    }
  },

  clearError: () => set({ error: null }),
}))
