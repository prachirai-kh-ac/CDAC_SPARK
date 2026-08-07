import { useState } from 'react'
import {
  ScrollText, Search, Filter,
  ChevronDown, Download, User,
  Shield, ClipboardList, BookOpen,
  AlertTriangle, CheckCircle2, Settings
} from 'lucide-react'

const logs = [
  { id: 1,  user: 'Admin User',         role: 'admin',   action: 'Created teacher account',         detail: 'Prof. Deepak Verma account created',          time: 'Jun 25, 10:02 AM', type: 'user'    },
  { id: 2,  user: 'Prof. Anjali Mehta', role: 'teacher', action: 'Published exam',                  detail: 'Core Java Unit Test 3 — DAC-42',               time: 'Jun 25, 09:45 AM', type: 'exam'    },
  { id: 3,  user: 'Rahul Sharma',       role: 'student', action: 'Completed exam',                  detail: 'Core Java Unit Test 3 — Score: 88%',           time: 'Jun 25, 11:32 AM', type: 'exam'    },
  { id: 4,  user: 'Prof. Rajan Sharma', role: 'teacher', action: 'Added questions to bank',         detail: '15 questions added to DSA module',             time: 'Jun 24, 03:15 PM', type: 'content' },
  { id: 5,  user: 'Admin User',         role: 'admin',   action: 'Suspended student account',       detail: 'Rohit Verma — PRN2024007',                    time: 'Jun 24, 02:00 PM', type: 'user'    },
  { id: 6,  user: 'Arjun Singh',        role: 'student', action: 'Violation recorded',              detail: 'Tab switch during Core Java Unit Test 3',      time: 'Jun 25, 10:14 AM', type: 'security'},
  { id: 7,  user: 'Prof. Anjali Mehta', role: 'teacher', action: 'Published results',              detail: 'DBMS Internal Exam — Avg: 65%',                time: 'Jun 24, 05:00 PM', type: 'exam'    },
  { id: 8,  user: 'Admin User',         role: 'admin',   action: 'Created new batch',               detail: 'DAC-44 batch created — 35 students',          time: 'Jun 23, 11:00 AM', type: 'user'    },
  { id: 9,  user: 'Rohit Verma',        role: 'student', action: 'Auto-submitted exam',             detail: '3 violations — Core Java Unit Test 3',        time: 'Jun 25, 10:28 AM', type: 'security'},
  { id: 10, user: 'Prof. Sunil Patil',  role: 'teacher', action: 'Created announcement',           detail: 'OS Exam schedule update for DAC-44',          time: 'Jun 23, 09:30 AM', type: 'content' },
  { id: 11, user: 'Meera Iyer',         role: 'student', action: 'Logged in',                      detail: 'Login from 192.168.1.45',                     time: 'Jun 25, 08:55 AM', type: 'auth'    },
  { id: 12, user: 'Admin User',         role: 'admin',   action: 'Updated platform settings',       detail: 'Max violations changed from 2 to 3',          time: 'Jun 22, 04:00 PM', type: 'settings'},
]

const typeConfig: Record<string, { icon: React.ElementType, color: string, bg: string, label: string }> = {
  user:     { icon: User,          color: 'text-primary-600', bg: 'bg-primary-50',  label: 'User'     },
  exam:     { icon: ClipboardList, color: 'text-blue-600',    bg: 'bg-blue-50',     label: 'Exam'     },
  content:  { icon: BookOpen,      color: 'text-emerald-600', bg: 'bg-emerald-50',  label: 'Content'  },
  security: { icon: AlertTriangle, color: 'text-red-600',     bg: 'bg-red-50',      label: 'Security' },
  auth:     { icon: Shield,        color: 'text-amber-600',   bg: 'bg-amber-50',    label: 'Auth'     },
  settings: { icon: Settings,      color: 'text-slate-600',   bg: 'bg-slate-100',   label: 'Settings' },
}

const roleColors: Record<string, string> = {
  admin:   'bg-slate-100 text-slate-700',
  teacher: 'bg-blue-50 text-blue-700',
  student: 'bg-primary-50 text-primary-700',
}

export default function AuditLogs() {
  const [search, setSearch]         = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterRole, setFilterRole] = useState('All')

  const filtered = logs.filter(l => {
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) ||
                        l.action.toLowerCase().includes(search.toLowerCase()) ||
                        l.detail.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'All' || l.type === filterType.toLowerCase()
    const matchRole = filterRole === 'All' || l.role === filterRole.toLowerCase()
    return matchSearch && matchType && matchRole
  })

  return (
    <div className="space-y-6 animate-slide-up">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-0.5">Complete system activity history</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(typeConfig).slice(0, 4).map(([key, config]) => {
          const Icon = config.icon
          return (
            <div key={key} className="card flex items-center gap-3">
              <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {logs.filter(l => l.type === key).length}
                </p>
                <p className="text-xs text-slate-500">{config.label} Events</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="relative">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="input-field pr-8 appearance-none cursor-pointer"
          >
            {['All', 'User', 'Exam', 'Content', 'Security', 'Auth', 'Settings'].map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="input-field pr-8 appearance-none cursor-pointer"
          >
            {['All', 'Admin', 'Teacher', 'Student'].map(r => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Logs Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                {['Type', 'User', 'Role', 'Action', 'Details', 'Time'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(log => {
                const config = typeConfig[log.type]
                const Icon   = config.icon
                return (
                  <tr key={log.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800 whitespace-nowrap">{log.user}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge capitalize ${roleColors[log.role]}`}>{log.role}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700 whitespace-nowrap">{log.action}</p>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-xs text-slate-500 truncate">{log.detail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-400 whitespace-nowrap">{log.time}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No logs match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
