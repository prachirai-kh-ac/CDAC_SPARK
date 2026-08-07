import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts'
import {
  TrendingUp, Users, CheckCircle2, ChevronDown, Loader2,
  BarChart2, AlertTriangle, Award, XCircle
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function ExamAnalytics() {
  const { user } = useAuth()
  const [exams, setExams] = useState<any[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [analytics, setAnalytics] = useState<any>(null)
  const [loadingExams, setLoadingExams] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  // Fetch Exams list
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exams')
        if (res.data) {
          const userId = user?.id || user?.userId;
          const myExams = res.data.filter((e: any) => e.teacherId == userId)
          
          setExams(myExams)
          if (myExams.length > 0) {
            setSelectedExamId(myExams[0].id?.toString() || myExams[0].examId?.toString() || '')
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingExams(false)
      }
    }
    fetchExams()
  }, [])

  // Fetch Analytics for selected exam
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedExamId) return
      setLoadingAnalytics(true)
      try {
        const res = await api.get(`/result/teacher/exams/${selectedExamId}/analytics`)
        if (res.data) {
          setAnalytics(res.data)
        }
      } catch (err) {
        console.error(err)
        setAnalytics(null)
      } finally {
        setLoadingAnalytics(false)
      }
    }
    fetchAnalytics()
  }, [selectedExamId])

  if (loadingExams) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const displayAnalytics = analytics || {
    totalAppeared: 0,
    averageScore: 0,
    passRate: 0,
    passCount: 0,
    failCount: 0
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 flex-shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Exam Analytics</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Deep insights into batch performance and module weaknesses.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative min-w-[200px]">
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            >
              {exams.length === 0 ? (
                <option value="">No exams available</option>
              ) : (
                exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {loadingAnalytics ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Top KPIs - 4 Columns grid for compact balance */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3.5 hover:border-slate-300 transition-colors">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{displayAnalytics.totalAppeared}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Students Appeared</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3.5 hover:border-slate-300 transition-colors">
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{displayAnalytics.averageScore}%</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Batch Avg. Score</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3.5 hover:border-slate-300 transition-colors">
              <div className="w-11 h-11 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{displayAnalytics.passRate || (displayAnalytics.totalAppeared > 0 ? Math.round((displayAnalytics.passCount / displayAnalytics.totalAppeared) * 100) : 0)}%</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pass Rate</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3.5 hover:border-slate-300 transition-colors">
              <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{displayAnalytics.failCount}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Failed Students</p>
              </div>
            </div>
          </div>

          {/* ADVANCED ANALYTICS SECTION */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Batch Performance Trajectory</h3>
                <p className="text-xs text-slate-500 font-medium">Average score of the batch over the last 5 mock tests.</p>
              </div>
            </div>
            
            <div className="w-full h-56">
              {displayAnalytics.batchTrajectory?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={displayAnalytics.batchTrajectory.length === 1 ? [{name: 'Start', average: 0}, ...displayAnalytics.batchTrajectory] : displayAnalytics.batchTrajectory} 
                    margin={{ top: 10, right: 15, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={5} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      name="Average Score (%)"
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }} 
                      activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium text-xs">No Analytics Available</div>
              )}
            </div>
          </div>

          {/* Third Row: Red Flags & Basic Pass/Fail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Question Quality Red Flags */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Question Quality "Red Flags"</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Questions with abnormal failure rates (&lt; 25% accuracy)</p>
                </div>
                <div className="w-9 h-9 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="overflow-x-auto p-3 flex-1">
                <table className="w-full text-left">
                  <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-2">Q-ID / Topic</th>
                      <th className="px-3 py-2">Question Snippet</th>
                      <th className="px-3 py-2 text-right">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {displayAnalytics.redFlags && displayAnalytics.redFlags.length > 0 ? displayAnalytics.redFlags.map((flag: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5">
                          <p className="font-mono text-xs font-bold text-slate-700">{flag.id}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{flag.topic}</p>
                        </td>
                        <td className="px-3 py-2.5 text-xs font-medium text-slate-700 max-w-[220px] truncate">
                          {flag.text}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            flag.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {flag.accuracy}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <CheckCircle2 className="w-7 h-7 text-emerald-400 mb-1.5" />
                            <p className="text-slate-700 text-sm font-bold">No Red Flags Found!</p>
                            <p className="text-slate-400 text-xs font-medium mt-0.5">All questions have an acceptable accuracy rate.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pass/Fail Donut */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 text-center">Pass / Fail Ratio</h3>
                <p className="text-xs text-slate-500 font-medium text-center mb-2">Current Exam Snapshot</p>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center min-h-[160px]">
                {displayAnalytics.totalAppeared > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Passed', value: displayAnalytics.passCount, color: '#10b981' },
                            { name: 'Failed', value: displayAnalytics.failCount, color: '#ef4444' }
                          ]}
                          cx="50%" cy="50%" innerRadius={48} outerRadius={68} dataKey="value" stroke="none"
                        >
                          {[
                            { name: 'Passed', value: displayAnalytics.passCount, color: '#10b981' },
                            { name: 'Failed', value: displayAnalytics.failCount, color: '#ef4444' }
                          ].map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-slate-700">{displayAnalytics.passCount}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Passed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="text-xs font-bold text-slate-700">{displayAnalytics.failCount}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Failed</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400 py-6">
                    <PieChart className="w-10 h-10 mx-auto opacity-20 mb-2" />
                    <p className="text-xs font-medium">No submission data yet.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  )
}
