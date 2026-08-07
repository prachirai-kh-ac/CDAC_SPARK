import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock, BookOpen, ChevronRight, AlertCircle, Calendar,
  CheckCircle2, Play, Lock
} from 'lucide-react'

import { studentService } from '../../services/studentService'

export default function MockTest() {
  const navigate = useNavigate()
  
  const [liveExams, setLiveExams] = useState<any[]>([])
  const [completedExams, setCompletedExams] = useState<any[]>([])
  const [upcomingExams, setUpcomingExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date().getTime())

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const [liveRes, upcomingRes, historyRes] = await Promise.all([
          studentService.getLiveExams(),
          studentService.getUpcomingExams(),
          studentService.getAttemptHistory()
        ]);

        const liveData = liveRes.success ? liveRes.data : [];
        const upcomingData = upcomingRes.success ? upcomingRes.data : [];
        const historyData = historyRes.success ? historyRes.data : [];
        
        // Find ALL attempts that are either COMPLETED or have a submittedAt date
        const completedExamIds = Array.isArray(historyData) 
          ? historyData.filter((h: any) => h.status === 'COMPLETED' || h.submittedAt).map((h: any) => Number(h.examId)) 
          : [];
          
        const inProgressExamIds = Array.isArray(historyData)
          ? historyData.filter((h: any) => h.status === 'IN_PROGRESS' && !h.submittedAt).map((h: any) => Number(h.examId))
          : [];

        if (Array.isArray(liveData)) {
           const nowTime = new Date().getTime();
           
           const live = liveData.filter((e: any) => {
              if (completedExamIds.includes(Number(e.id))) return false;
              if (e.status === 'Stopped' || e.status === 'Draft' || e.status === 'Archived' || e.status === 'Completed') return false;
              return true;
           }).map((e: any) => ({
             id: e.id,
             title: e.title || e.examName,
             module: e.moduleName || e.description || 'General',
             batch: e.batchName,
             questions: e.totalQuestions,
             duration: e.durationMinutes || e.duration,
             status: 'LIVE',
             scheduledAt: e.scheduledAt,
             inProgress: inProgressExamIds.includes(Number(e.id))
           }));
           setLiveExams(live);
        }

        if (Array.isArray(upcomingData)) {
           const nowTime = new Date().getTime();
           const scheduled = upcomingData.filter((e: any) => {
              if (completedExamIds.includes(Number(e.id))) return false;
              if (e.status === 'Stopped' || e.status === 'Draft' || e.status === 'Archived' || e.status === 'Completed' || e.status === 'Live' || e.status === 'LIVE' || e.status === 'Active' || e.status === 'ACTIVE') return false;
              
              if (e.scheduledAt) {
                  const startTime = new Date(e.scheduledAt).getTime();
                  if (nowTime >= startTime) return false;
              }
              return true;
           }).map((e: any) => ({
             id: e.id,
             title: e.title || e.examName,
             module: e.moduleName || e.description || 'General',
             batch: e.batchName,
             date: new Date(e.scheduledAt).toLocaleDateString(),
             time: new Date(e.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             duration: e.durationMinutes || e.duration,
             targetDate: new Date(e.scheduledAt).toISOString()
           }));
           setUpcomingExams(scheduled);
        }

        if (Array.isArray(historyData)) {
           const completedHistory = historyData.filter((h: any) => h.status === 'COMPLETED' || h.submittedAt);
           
           setCompletedExams(completedHistory.map((h: any) => {
             const isPublished = Boolean(h.isPublished);
             
             return {
               id: h.id || h.examId,
               attemptId: h.attemptId,
               title: h.examTitle || 'Exam',
               module: h.batchName || 'General',
               score: isPublished ? h.score : 'Pending', 
               percentage: isPublished ? h.percentage : 'Pending', 
               submittedDate: (h.submittedAt || h.date) ? new Date(h.submittedAt || h.date).toLocaleDateString() : 'N/A',
               status: isPublished ? 'Published' : 'Awaiting Result',
               isPublished: isPublished
             };
           }));
        }
      } catch (err) {
        console.error("Failed to load exams:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
    const pollInterval = setInterval(fetchExams, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date().getTime())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleStartExam = (exam: any) => {
    navigate('/student/exam/verify', { state: { exam } })
  }

  const getRemainingTime = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime()
    const diff = target - now

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return { days, hours, minutes }
  }

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Live Exams</h1>
          <p className="text-slate-500 mt-1">Participate in scheduled live assessments strictly monitored by your instructors.</p>
        </div>
      </div>

      {/* SECTION 1: ACTIVE LIVE EXAMS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-5 bg-rose-500 rounded-full inline-block"></span>
          <h2 className="text-lg font-bold text-slate-800">1. Active Live Exams</h2>
        </div>

        {liveExams.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center">
            <p className="text-slate-500 font-medium">No live exams are currently active for your batch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveExams.map(exam => (
              <div key={exam.id} className="bg-white border-2 border-rose-500/20 shadow-lg shadow-rose-500/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group hover:border-rose-500/40 transition-all duration-300">
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1 rounded-bl-xl flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE NOW
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight group-hover:text-rose-600 transition-colors">{exam.title}</h3>
                  <p className="text-xs font-semibold text-slate-400 mb-4">{exam.module}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-center">
                      <BookOpen className="w-4 h-4 text-slate-400 mb-1" />
                      <span className="text-sm font-bold text-slate-700">{exam.questions}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Questions</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-center">
                      <Clock className="w-4 h-4 text-slate-400 mb-1" />
                      <span className="text-sm font-bold text-slate-700">{exam.duration}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Mins</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartExam(exam)}
                  className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {exam.inProgress ? 'Resume Assessment' : 'Start Assessment'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: UPCOMING EXAMS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-slate-800">2. Upcoming Exams</h2>
        </div>

        {upcomingExams.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
            <p className="text-slate-500">No upcoming scheduled exams.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingExams.map(exam => {
              const remaining = getRemainingTime(exam.targetDate)
              return (
                <div key={exam.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                      <p className="text-sm text-slate-500">{exam.module}</p>
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">Starts In</p>
                    <div className="flex items-center justify-center gap-3 text-center">
                      <div>
                        <span className="text-xl font-extrabold text-slate-800">{String(remaining.days).padStart(2, '0')}</span>
                        <span className="block text-[9px] text-slate-400 uppercase font-semibold">Days</span>
                      </div>
                      <span className="text-slate-300 font-bold text-lg mb-3">:</span>
                      <div>
                        <span className="text-xl font-extrabold text-slate-800">{String(remaining.hours).padStart(2, '0')}</span>
                        <span className="block text-[9px] text-slate-400 uppercase font-semibold">Hours</span>
                      </div>
                      <span className="text-slate-300 font-bold text-lg mb-3">:</span>
                      <div>
                        <span className="text-xl font-extrabold text-slate-800">{String(remaining.minutes).padStart(2, '0')}</span>
                        <span className="block text-[9px] text-slate-400 uppercase font-semibold">Mins</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Exam Date</span>
                      <span className="font-semibold text-slate-800">{exam.date}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</span>
                      <span className="font-semibold text-slate-800">{exam.time}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* SECTION 3: COMPLETED EXAMS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-800">3. Completed Exams</h2>
        </div>
        
        {completedExams.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
            <p className="text-slate-500">You haven't completed any live exams yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedExams.map(exam => (
              <div key={exam.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{exam.title}</h3>
                    <p className={`text-sm font-medium ${exam.isPublished ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {exam.isPublished ? 'Submitted & Published' : 'Submitted (Result Pending)'}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${exam.isPublished ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                    {exam.isPublished ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div className={`rounded-lg p-3 ${!exam.isPublished ? 'bg-amber-50' : Number(exam.percentage) >= 40 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <p className={`text-xs mb-1 ${!exam.isPublished ? 'text-amber-600' : Number(exam.percentage) >= 40 ? 'text-emerald-600' : 'text-red-600'}`}>Status</p>
                    <p className={`text-lg font-bold ${!exam.isPublished ? 'text-amber-700' : Number(exam.percentage) >= 40 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {!exam.isPublished ? 'Pending' : Number(exam.percentage) >= 40 ? 'PASS' : 'FAIL'}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Percentage</p>
                    <p className="text-lg font-bold text-slate-800">{exam.isPublished ? `${exam.percentage}%` : 'Pending'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rules Banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mt-8">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800">One Attempt Rule</p>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Students are permitted strictly <b>one attempt</b> per Live Exam. The exam will automatically submit when the timer expires. 
            Do not refresh the page or use the back button during an active exam. Multiple sessions are prohibited and will result in disqualification.
          </p>
        </div>
      </div>
    </div>
  )
}
