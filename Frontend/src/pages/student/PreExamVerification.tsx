import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Shield, ChevronRight, AlertCircle } from 'lucide-react'

export default function PreExamVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const exam = location.state?.exam

  const [agreed, setAgreed] = useState(false)

  return (
    <div className="max-w-2xl mx-auto animate-slide-up pb-10">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Pre-Exam Verification</h1>
        <p className="text-slate-500 text-sm mt-1">
          {exam?.title || 'Exam'} — Please review the rules before you begin
        </p>
      </div>

      {/* Exam Info */}
      {exam && (
        <div className="card mb-6 bg-primary-50 border-primary-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-primary-700">{exam.questions}</p>
              <p className="text-xs text-primary-500">Questions</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary-700">{exam.duration} min</p>
              <p className="text-xs text-primary-500">Duration</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary-700">{exam.module}</p>
              <p className="text-xs text-primary-500">Module</p>
            </div>
          </div>
        </div>
      )}

      {/* Rules + Agreement */}
      <div className="space-y-4 animate-slide-up">
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Exam Rules
          </h3>
          <ul className="space-y-2">
            {[
              'Keep your camera and microphone ON throughout the exam',
              'Do not switch tabs or minimize the browser window',
              'Do not use any external resources or assistance',
              'Ensure you are in a quiet, well-lit environment',
              'Exam will auto-submit after 3 violations',
              'Once started, the timer cannot be paused',
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="w-5 h-5 bg-surface-100 rounded-full flex items-center justify-center text-xs font-semibold text-slate-500 flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>

          <label className="flex items-center gap-3 mt-4 p-3 rounded-lg border border-surface-200 cursor-pointer hover:bg-surface-50 transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="w-4 h-4 accent-primary-600"
            />
            <span className="text-sm text-slate-700">
              I have read and agree to all exam rules and conditions
            </span>
          </label>
        </div>

        <button
          onClick={() => navigate('/student/exam/portal', { state: { exam } })}
          disabled={!agreed}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-blue-600"
        >
          Enter Exam
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
