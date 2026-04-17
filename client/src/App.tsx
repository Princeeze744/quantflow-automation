import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Sidebar from './components/ui/Sidebar'
import MobileHeader from './components/ui/MobileHeader'
import MobileNav from './components/ui/MobileNav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Journal from './pages/Journal'
import Analytics from './pages/Analytics'
import AiCoach from './pages/AiCoach'
import RiskManager from './pages/RiskManager'
import MarketIntel from './pages/MarketIntel'
import Settings from './pages/Settings'
import Insights from './pages/Insights'
import Playbooks from './pages/Playbooks'
import Notebook from './pages/Notebook'

function ProtectedLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-brand-space">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ai-coach" element={<AiCoach />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/playbooks" element={<Playbooks />} />
          <Route path="/notebook" element={<Notebook />} />
          <Route path="/risk" element={<RiskManager />} />
          <Route path="/market" element={<MarketIntel />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <MobileNav />
    </div>
  )
}

export default function App() {
  const { token, loadUser } = useAuthStore()
  useEffect(() => { loadUser() }, [loadUser])
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
      <Route path="/*" element={token ? <ProtectedLayout /> : <Navigate to="/login" />} />
    </Routes>
  )
}
