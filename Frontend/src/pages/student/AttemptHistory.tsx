import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  History, Search, Filter, CheckCircle2, XCircle,
  Clock, BarChart2, Download, Eye, ChevronDown, Loader2
} from 'lucide-react'
import { studentService } from '../../services/studentService'


export default function AttemptHistory() {
  const navigate = useNavigate()
  const [attempts, setAttempts]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await studentService.getAttemptHistory()
        if (res.success && res.data) {
          // Filter to only show COMPLETED exams
          const completedData = res.data.filter((item: any) => 
            item.status?.toUpperCase() === 'COMPLETED'
          );
          
          const mappedData = completedData.map((item: any) => {
            const isPublished = Boolean(item.isPublished);
            const scoreVal = Math.round(item.percentage || 0);
            const passed = scoreVal >= 40;
            return {
              id: item.id || item.attemptId,
              examTitle: item.examTitle || 'Live Exam',
              batchName: item.batchName || 'General',
              type: 'Live Exam',
              date: item.submittedAt || new Date().toISOString(),
              timeTaken: item.timeTakenSeconds ? Math.floor(item.timeTakenSeconds / 60) : 30,
              score: scoreVal,
              passed: passed,
              isPublished: isPublished,
              status: isPublished ? (passed ? 'Passed' : 'Failed') : 'Result Pending'
            };
          });
          setAttempts(mappedData)
        } else {
          setAttempts([])
        }
      } catch (err) {
        console.error("Failed to fetch attempt history", err)
        setAttempts([])
      } finally {
        setLoading(false)
      }
    }
    fetchAttempts()
  }, [])

  const passedCount = attempts.filter(a => a.isPublished && a.passed).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attempt History</h1>
          <p className="text-slate-500 text-sm mt-0.5">All your past tests and exams</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Attempts', value: attempts.length,  color: 'text-primary-600', bg: 'bg-primary-50',  icon: History       },
          { label: 'Passed',         value: passedCount,      color: 'text-emerald-600', bg: 'bg-emerald-50',  icon: CheckCircle2  },
          { label: 'Failed',         value: attempts.filter(a => a.isPublished && !a.passed).length, color: 'text-red-500', bg: 'bg-red-50', icon: XCircle }
        ].map(stat => (
          <div key={stat.label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>



      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                {['Test / Exam', 'Module', 'Type', 'Date', 'Score', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No attempts found yet.</p>
                  </td>
                </tr>
              ) : (
                attempts.map(attempt => {
                  const dt = new Date(attempt.date)
                  return (
                    <tr key={attempt.id} className="hover:bg-surface-50 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">{attempt.examTitle}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-600 font-medium">{attempt.batchName || 'N/A'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="badge bg-primary-50 text-primary-700">
                          {attempt.isPublished ? 'Published' : 'Completed'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-500">
                          {dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${
                            !attempt.isPublished ? 'text-amber-600' : attempt.passed ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {attempt.isPublished ? `${attempt.score}%` : 'Pending'}
                          </span>
                          {attempt.isPublished && (
                            <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  attempt.passed ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${attempt.score}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {!attempt.isPublished ? (
                            <Clock className="w-4 h-4 text-amber-500" />
                          ) : attempt.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-xs font-medium ${
                            !attempt.isPublished ? 'text-amber-600' : attempt.passed ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {!attempt.isPublished ? 'Result Pending' : attempt.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
