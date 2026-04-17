import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, BarChart3, Bot, Shield, Globe,
  Settings, TrendingUp, LogOut, Lightbulb, BookMarked, FileText,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/playbooks', icon: BookMarked, label: 'Playbooks' },
  { to: '/notebook', icon: FileText, label: 'Notebook' },
  { to: '/ai-coach', icon: Bot, label: 'AI Coach' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/risk', icon: Shield, label: 'Risk Manager' },
  { to: '/market', icon: Globe, label: 'Market Intel' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-brand-obsidian border-r border-white/5">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-violet flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-brand-space" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-brand-text tracking-wide">QUANTFLOW</h1>
          <p className="text-[10px] text-brand-silver tracking-widest uppercase">Automation</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-brand-cyan/10 text-brand-cyan glow-cyan' : 'text-brand-silver hover:text-brand-text hover:bg-white/5'}`}>
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-violet/20 flex items-center justify-center">
              <span className="text-xs font-bold text-brand-violet">{(user?.displayName || 'T')[0].toUpperCase()}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-text">{user?.displayName || 'Trader'}</p>
              <p className="text-[9px] text-brand-silver truncate max-w-[120px]">{user?.email}</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleLogout}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-silver hover:text-brand-loss hover:bg-brand-loss/10 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-brand-violet/20 to-brand-cyan/10 border border-brand-violet/20">
          <p className="text-[9px] uppercase tracking-widest text-brand-violet font-semibold mb-0.5">Powered by</p>
          <p className="text-sm font-bold text-brand-text">Trade2Retire Academy</p>
          <p className="text-[10px] text-brand-silver mt-0.5">Learn. Trade. Retire.</p>
        </div>
      </div>
    </aside>
  )
}
