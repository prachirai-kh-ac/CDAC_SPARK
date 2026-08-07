import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CheckCircle2, XCircle, Clock, AlertTriangle,
  BarChart2, RotateCcw, Home, Download, Brain, Loader2
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts'
import { examService } from '../../services/examService'

export default function ExamResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}
  const attemptId = state.attemptId

  const [loading, setLoading] = useState(!!attemptId)
  const [resultData, setResultData] = useState<any>(null)

  useEffect(() => {
    if (!attemptId) return

    const fetchResult = async () => {
      try {
        const res = await examService.getResult(Number(attemptId))
        if (res.success) {
          setResultData(res.data)
        } else {
          alert(res.message || 'Failed to fetch result')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [attemptId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Calculating your exam results...</p>
        </div>
      </div>
    )
  }

  // Extract from resultData or fallback to 0 if no attemptId
  const examTitle = resultData?.examTitle || state.exam?.title || 'Examination'
  const score = resultData !== null ? resultData.correctAnswers : (state.score ?? 0)
  const total = resultData !== null ? resultData.questionReview?.length || 0 : (state.total ?? 0)
  const violations = resultData !== null ? resultData.violationCount : (state.violations ?? 0)
  const timeTaken = resultData !== null ? resultData.timeTakenSeconds : (state.timeTaken ?? 0)
  const passed = resultData !== null ? resultData.passed : total > 0 ? (score / total >= 0.4) : false
  const percentage = resultData !== null ? resultData.percentage : total > 0 ? Math.round((score / total) * 100) : 0

  // Map questions review
  const reviews = resultData !== null
    ? resultData.questionReview.map((r: any) => ({
        question: r.questionText,
        options: [r.optionA, r.optionB, r.optionC, r.optionD],
        correct: r.correctOption,
        selected: r.selectedOption,
        isCorrect: r.isCorrect,
        isSkipped: r.isSkipped,
        explanation: r.explanation
      }))
    : (state.questions || []).map((q: any, i: number) => ({
        question: q.question || q.questionText,
        options: q.options || [q.optionA, q.optionB, q.optionC, q.optionD],
        correct: q.correct || q.correctOption,
        selected: state.answers?.[i] ?? null,
        isCorrect: state.answers?.[i] === (q.correct ?? q.correctOption),
        isSkipped: state.answers?.[i] === null,
        explanation: q.explanation
      }))

  const skipped = reviews.filter((r: any) => r.isSkipped).length
  const wrong = reviews.filter((r: any) => !r.isCorrect && !r.isSkipped).length
  const accuracy = Math.round((score / (total - skipped || 1)) * 100)

  const pieData = [
    { name: 'Correct', value: score, color: '#10b981' },
    { name: 'Wrong', value: wrong, color: '#ef4444' },
    { name: 'Skipped', value: skipped, color: '#e2e8f0' },
  ]

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}m ${s}s`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up pb-10">

      {/* Result Header */}
      <div className={`card text-center border-2 ${passed ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
          passed ? 'bg-emerald-100' : 'bg-red-100'
        }`}>
          {passed
            ? <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            : <XCircle className="w-10 h-10 text-red-500" />
          }
        </div>
        <h1 className={`text-2xl font-bold mb-1 ${passed ? 'text-emerald-800' : 'text-red-800'}`}>
          {passed ? 'Congratulations! You Passed' : 'Better luck next time'}
        </h1>
        <p className="text-slate-500 text-sm mb-4">
          {examTitle} — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div className="text-6xl font-bold mb-2" style={{ color: passed ? '#10b981' : '#ef4444' }}>
          {percentage}%
        </div>
        <p className="text-slate-500 text-sm">{score} out of {total} correct</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ability Score', value: resultData?.abilityScore || 0, icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Weighted Score', value: resultData?.weightedScore || 0, icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Accuracy', value: `${resultData?.accuracy?.toFixed(1) || accuracy}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Time Taken', value: formatTime(timeTaken), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map(stat => (
          <div key={stat.label} className="card text-center" style={{ contentVisibility: 'auto' }}>
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="max-w-md mx-auto">
        {/* Pie Chart */}
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4 text-center">Answer Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                dataKey="value"
                paddingAngle={3}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => [val, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-slate-600">{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Review */}
      {reviews.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary-600" />
            Question Review
          </h3>
          <div className="space-y-3">
            {reviews.map((q: any, i: number) => {
              const optLetter = ['A', 'B', 'C', 'D']
              const isCorrect = q.isCorrect
              const isSkipped = q.isSkipped
              return (
                <div key={i} className={`p-4 rounded-xl border ${
                  isSkipped ? 'border-surface-200 bg-surface-50' :
                  isCorrect ? 'border-emerald-200 bg-emerald-50' :
                              'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start gap-3">
                    {isSkipped
                      ? <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                      : isCorrect
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 mb-2">{q.question}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-slate-600">
                        {q.options.map((opt: string, oIdx: number) => (
                          <div key={oIdx} className={
                            oIdx === q.correct ? 'text-emerald-700 font-bold' : 
                            (oIdx === q.selected && !isCorrect) ? 'text-red-700 font-bold' : ''
                          }>
                            {optLetter[oIdx]}: {opt}
                          </div>
                        ))}
                      </div>

                      {isSkipped && (
                        <p className="text-xs text-slate-400">Not attempted</p>
                      )}
                      {!isSkipped && !isCorrect && (
                        <p className="text-xs text-red-600 mb-1">
                          Your Answer: <strong>{q.options[q.selected]}</strong>
                        </p>
                      )}
                      
                      {q.explanation && (
                        <div className="mt-2 text-xs text-slate-500 bg-white/50 p-2 rounded border border-slate-100">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="btn-secondary flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="btn-secondary flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Back to list
        </button>
      </div>
    </div>
  )
}
