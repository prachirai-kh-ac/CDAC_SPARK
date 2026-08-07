import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, Trophy, BookOpen, Star, Play, Loader2, Radio
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts'
import { studentService } from '../../services/studentService'
import { useAuth } from '../../context/AuthContext'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await studentService.getDashboard()
        if (res.success) setDashboard(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const recentResults = dashboard?.recentResults || []

  const overallScore = dashboard?.overallScore || 0
  const examsCompleted = dashboard?.examsCompleted || 0
  const practiceDone = dashboard?.practiceDone || 0
  const rank = dashboard?.rank || '-'

  const performanceData = dashboard?.performanceData || []
  const subjectData = dashboard?.subjectData || []
  const accuracyData = dashboard?.accuracyData || []

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-md">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="mb-1 text-2xl font-extrabold tracking-tight">{user?.name || user?.fullName || 'Student'}</h1>
          <p className="text-xs text-blue-100 font-medium">
            PRN: {user?.prn || 'N/A'} • Batch: {user?.batchName || 'Unassigned Batch'} • Course: {user?.courseName || 'Unassigned Course'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        {[
          { label: 'Exams Completed', value: examsCompleted, icon: Trophy, bg: 'bg-orange-50', color: 'text-orange-500' },
          { label: 'Avg. Score', value: `${overallScore}%`, icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-500' },
        ].map((kpi, i) => (
          <div key={i} className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-3xl font-bold text-slate-800">{kpi.value}</h3>
              <p className="mt-1 text-xs font-medium text-slate-400">{kpi.label}</p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.bg}`}>
              <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Row 1 Analytics: Performance Trend & Accuracy */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Performance Trend */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 h-full">
            <h3 className="text-base font-bold text-slate-800 mb-6">Performance Trend</h3>
            {performanceData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" name="Your Score" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
                <p className="text-slate-400 font-medium">No performance data available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Accuracy by Difficulty */}
        <div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-2">Accuracy by Difficulty</h3>
            {accuracyData.length > 0 ? (
              <div className="h-64 flex-1 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <RechartsTooltip 
                      formatter={(value: any) => [`${value}%`, 'Accuracy']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{fill: '#f8fafc'}}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {accuracyData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex-1 w-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50 mt-4">
                <p className="text-slate-400 font-medium">No accuracy data available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 Analytics: Subject Strengths */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Subject Strengths */}
        <div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 h-full">
            <h3 className="text-base font-bold text-slate-800 mb-2">Subject Strengths</h3>
            {subjectData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={subjectData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 w-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50 mt-4">
                <p className="text-slate-400 font-medium">No subject data available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Subject Weaknesses */}
        <div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 h-full">
            <h3 className="text-base font-bold text-slate-800 mb-2">Subject Weaknesses</h3>
            {subjectData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={subjectData.map((d: any) => ({ ...d, weakness: 100 - d.score }))}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Radar name="Needs Improvement" dataKey="weakness" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                    <RechartsTooltip 
                      formatter={(value: any) => [`${value}%`, 'Weakness']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 w-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50 mt-4">
                <p className="text-slate-400 font-medium">No subject data available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
