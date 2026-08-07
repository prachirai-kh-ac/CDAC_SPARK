import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, GraduationCap, ChevronRight, Loader2, Activity
} from 'lucide-react'
import api from '../../services/api'

const INITIAL_STATS = {
  totalStudents: 0,
  totalTeachers: 0,
  globalPassRate: "N/A",
  activeLiveExams: "N/A",
};

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(INITIAL_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard')
        if (res.data && res.data.success) {
          setStats({
            totalStudents: res.data.data.totalStudents || 0,
            totalTeachers: res.data.data.totalTeachers || 0,
            globalPassRate: res.data.data.globalPassRate || "N/A",
            activeLiveExams: res.data.data.activeLiveExams || "N/A"
          })
        }
      } catch (err) {
        console.error("Failed to fetch admin dashboard", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 animate-fade-in pb-10">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Platform overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { label: 'Total Students', value: stats.totalStudents, change: 'Enrolled students', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50',  onClick: () => navigate('/admin/students')  },
          { label: 'Total Teachers', value: stats.totalTeachers, change: 'Active faculty',  icon: Users,         color: 'text-indigo-600',  bg: 'bg-indigo-50',   onClick: () => navigate('/admin/teachers')  },
          { label: 'Active Live Exams', value: stats.activeLiveExams, change: stats.activeLiveExams !== "N/A" ? 'Currently running' : 'System active',  icon: Activity,      color: 'text-rose-600',    bg: 'bg-rose-50',     onClick: () => {}  },
        ].map(kpi => (
          <div
            key={kpi.label}
            onClick={kpi.onClick}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${kpi.bg} rounded-xl flex items-center justify-center shadow-inner`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{kpi.label}</p>
              <p className={`text-xs font-semibold mt-1.5 ${kpi.value === "N/A" ? "text-slate-400" : "text-emerald-600"}`}>{kpi.change}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
