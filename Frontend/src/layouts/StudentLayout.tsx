import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BookOpen, LayoutDashboard, Brain, ClipboardList,
  History, Trophy, User, LogOut, Menu, X
} from 'lucide-react'

const navItems = [
  { to: '/student/dashboard',   icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/student/practice',    icon: Brain,           label: 'Practice MCQ'    },
  { to: '/student/mock-test',   icon: ClipboardList,   label: 'Live Exam'       },
  { to: '/student/history',     icon: History,         label: 'Attempt History' },
  { to: '/student/leaderboard', icon: Trophy,          label: 'Leaderboard'     },
  { to: '/student/profile',     icon: User,            label: 'My Account'      },
]

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  // Hide sidebar and topbar completely for Live Exam
  if (location.pathname.includes('/exam/portal')) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#e8eef4' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar Matching Reference UI ── */}
      <aside className={`
        fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `} style={{ width: 220, background: '#e8eef4' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-white/80 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-slate-600" />
          </div>
          <span className="font-bold text-slate-700 tracking-tight text-sm">CDAC SPARK</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white shadow-sm text-sky-600 font-bold'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

      </aside>

      {/* ── Main Section ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />

          {/* Right controls */}
          <div className="flex items-center gap-4 ml-auto relative">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-sm text-slate-800">{user?.name || user?.fullName || 'Student'}</div>
              <div className="text-xs text-slate-500 capitalize">{user?.role || 'Student'}</div>
            </div>
            
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 hover:bg-white/70 rounded-lg transition-colors border border-transparent hover:border-white shadow-sm"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-surface-100 py-1 z-50 animate-fade-in overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto px-6 pb-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
