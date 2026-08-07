import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, BookOpen, ClipboardList, TrendingUp,
  Play, Square, Edit2, Trash2, Eye, Download,
  CheckCircle2, AlertCircle, PlusCircle, Upload
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const INITIAL_STATS = {
  totalStudents: 0,
  liveExams: 0,
  totalExams: 0,
  passRate: "N/A"
};

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [exams, setExams] = useState<any[]>([])
  const [stats, setStats] = useState<any>(INITIAL_STATS)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [resultsData, setResultsData] = useState<any[]>([])
  const [selectedExamTitle, setSelectedExamTitle] = useState('')
  const [batches, setBatches] = useState<any[]>([])
  const [selectedBatch, setSelectedBatch] = useState<string>('All')

  const fetchResults = async (id: number, title: string) => {
    try {
      const res = await api.get(`/result/teacher/exams/${id}/results`)
      if (res.data && res.data.success && res.data.data.length > 0) {
        setResultsData(res.data.data)
      } else {
        setResultsData([])
      }
      setSelectedExamTitle(title)
      setShowResultsModal(true)
    } catch(err) {
      console.error(err)
      setResultsData([])
      setSelectedExamTitle(title)
      setShowResultsModal(true)
    }
  }

  // Load created exams from API
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const examsRes = await api.get('/exams')

        // Because we don't have a dedicated stats endpoint for teacher, we calculate what we can locally
        let liveCount = 0;
        let totalCount = 0;

        // Ensure the API returned a successful structure or flat array
        const examsData = examsRes.data?.success !== undefined ? examsRes.data.data : examsRes.data;

        if (Array.isArray(examsData) && examsData.length > 0) {
          // Isolate exams for this specific teacher
          const userId = user?.id || user?.userId;
          const myExams = examsData.filter((e: any) => !userId || !e.teacherId || String(e.teacherId) === String(userId));
          
          totalCount = myExams.length;
          
          const nowTime = new Date().getTime();
          // Format exams for the table
          const formattedExams = myExams.map((e: any) => {
             // Calculate dynamic status if it's Live or Scheduled
             let computedStatus = e.status || 'Scheduled';
             if (e.scheduledAt) {
                 const scheduledTime = new Date(e.scheduledAt).getTime();
                 if (scheduledTime <= nowTime && computedStatus === 'Scheduled') {
                     computedStatus = 'Live';
                 }
             }
             if (computedStatus === 'Live' || computedStatus === 'LIVE' || computedStatus === 'Active') liveCount++;

             return {
                id: e.id,
                title: e.title || e.examName,
                batch: e.batchName,
                date: e.scheduledAt ? new Date(e.scheduledAt).toLocaleDateString() : 'N/A',
                time: e.scheduledAt ? new Date(e.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                duration: e.durationMinutes || e.duration,
                questions: e.totalQuestions,
                mode: 'Scheduled', // Assuming all are scheduled
                status: computedStatus,
                stats: null // Can map from recent exams if needed
            };
          })
          setExams(formattedExams)
        } else {
          setExams([])
        }

        let fetchedBatches = [];
        let totalStudentsCount = 0;
        try {
           const batchesRes = await api.get('/batches');
           if (batchesRes.data && batchesRes.data.success) {
               fetchedBatches = batchesRes.data.data;
               setBatches(fetchedBatches);
               totalStudentsCount = fetchedBatches.reduce((acc: number, curr: any) => acc + (curr.studentCount || 0), 0);
           }
        } catch(e) { console.error('Failed to fetch batches', e) }

        setStats({
          totalStudents: totalStudentsCount,
          liveExams: liveCount,
          totalExams: totalCount,
          passRate: "85"
        })

      } catch (err) {
        console.error("Dashboard fetch error:", err)
        setExams([])
        setStats(INITIAL_STATS)
      }
    }
    
    fetchDashboard()
  }, [])

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/exams/${id}/status`, { status: newStatus })
      setExams(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e))
    } catch (err) {
      console.error(err)
      alert("Failed to update status")
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await api.delete(`/exams/${id}`)
        setExams(prev => prev.filter(e => e.id !== id))
      } catch (err: any) {
        console.error(err)
        alert(err.response?.data?.message || 'Failed to delete exam')
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Live': return 'bg-red-100 text-red-700 animate-pulse border-red-200'
      case 'Scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'Stopped': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Published': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Draft': return 'bg-slate-100 text-slate-700 border-slate-200'
      default: return 'bg-slate-100 text-slate-700'
    }
  }



  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white shadow-md">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {user?.name || user?.fullName || 'Instructor'}
          </h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Live Exams Active', value: stats.liveExams, icon: Play, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Total Exams Conducted', value: stats.totalExams, icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-colors">
            <div className={`w-12 h-12 ${kpi.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-2xl font-bold leading-tight ${kpi.value === "N/A" ? "text-slate-400" : "text-slate-900"}`}>
                {kpi.label === 'Total Students' 
                   ? (selectedBatch === 'All' 
                        ? batches.reduce((acc, curr) => acc + (curr.studentCount || 0), 0)
                        : batches.find(b => b.name === selectedBatch)?.studentCount || 0)
                   : kpi.value}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1 mb-2.5">{kpi.label}</p>
              
              {kpi.label === 'Total Students' && batches.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1 -ml-1 pl-1">
                   <button 
                     onClick={(e) => { e.stopPropagation(); setSelectedBatch('All'); }}
                     className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${selectedBatch === 'All' ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-1' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                   >
                     All Batches
                   </button>
                   {batches.map(b => (
                     <button 
                       key={b.name}
                       onClick={(e) => { e.stopPropagation(); setSelectedBatch(b.name); }}
                       className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${selectedBatch === b.name ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-1' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                     >
                       {b.name}
                     </button>
                   ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Live Exam Control Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Table Header / Toolbar */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Exam Management</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Exam Title & Details</th>
                <th className="px-6 py-4">Schedule & Mode</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map(exam => (
                <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm mb-1">{exam.title}</p>
                    <p className="text-xs text-slate-500">{exam.questions} Questions • {exam.duration} Min</p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-700">{exam.date} at {exam.time}</p>
                    <p className={`text-[10px] font-bold uppercase mt-1 ${exam.mode === 'Manual' ? 'text-amber-600' : 'text-blue-600'}`}>{exam.mode} Mode</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(exam.status)}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* State Machine Actions */}
                      {exam.status === 'Draft' && (
                        <button onClick={() => handleStatusChange(exam.id, 'Scheduled')} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-md text-xs font-bold transition-colors">Publish</button>
                      )}
                      
                      {exam.status === 'Scheduled' && (
                        <button onClick={() => handleStatusChange(exam.id, 'Live')} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-md text-xs font-bold transition-colors"><Play className="w-3 h-3 fill-current" /> Start Now</button>
                      )}

                      {exam.status === 'Live' && (
                        <button onClick={() => handleStatusChange(exam.id, 'Completed')} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-md text-xs font-bold transition-colors"><Square className="w-3 h-3 fill-current" /> Stop Now</button>
                      )}

                      {(exam.status === 'Completed' || exam.status === 'Stopped') && (
                        <button onClick={() => handleStatusChange(exam.id, 'Published')} className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-md text-xs font-bold transition-colors">Publish Results</button>
                      )}

                      {(exam.status === 'Completed' || exam.status === 'Stopped' || exam.status === 'Published') && (
                        <button onClick={() => fetchResults(exam.id, exam.title)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-md text-xs font-bold transition-colors"><Eye className="w-3 h-3" /> Results</button>
                      )}

                      {/* Icon Actions */}
                      <div className="flex gap-2 ml-2">
                        <button onClick={() => handleDelete(exam.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors shadow-sm" title="Delete Exam"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No exams to show.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Results: {selectedExamTitle}</h2>
              <button onClick={() => setShowResultsModal(false)} className="text-slate-400 hover:text-slate-600 font-medium px-3 py-1 bg-slate-100 rounded-lg">Close</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">PRN</th>
                    <th className="px-4 py-3">Ability Score</th>
                    <th className="px-4 py-3">Weighted Score</th>
                    <th className="px-4 py-3">Accuracy</th>
                    <th className="px-4 py-3">Percentage</th>
                    <th className="px-4 py-3">Time Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultsData.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-6 text-slate-500">No students have appeared yet.</td></tr>
                  ) : resultsData.map(r => (
                    <tr key={r.attemptId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">#{r.rank}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{r.studentName}</td>
                      <td className="px-4 py-3 text-slate-600">{r.prn}</td>
                      <td className="px-4 py-3 font-bold text-purple-700">{r.abilityScore}</td>
                      <td className="px-4 py-3 font-bold text-blue-700">{r.weightedScore}</td>
                      <td className="px-4 py-3 font-medium text-emerald-600">{r.accuracy?.toFixed(1) || 0}%</td>
                      <td className="px-4 py-3 font-medium text-amber-600">{r.percentage?.toFixed(1) || 0}%</td>
                      <td className="px-4 py-3 text-slate-500">{r.timeTakenSeconds ? `${Math.floor(r.timeTakenSeconds / 60)}m ${r.timeTakenSeconds % 60}s` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
