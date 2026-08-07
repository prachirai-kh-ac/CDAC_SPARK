import { useState, useEffect } from 'react'
import { Users, Loader2, Award, Target, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { studentService } from '../../services/studentService'

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await studentService.getLeaderboard()
        if (res.success && res.data && res.data.length > 0) {
          const userStr = localStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;
          
          const mappedData = res.data.map((student: any) => {
            const isCurrentUser = Boolean(user && (
              (user.userId && Number(user.userId) === Number(student.userId)) ||
              (user.id && Number(user.id) === Number(student.userId)) ||
              (user.prn && String(user.prn).trim() === String(student.prn).trim()) ||
              (user.email && String(user.email).trim().toLowerCase() === String(student.email).trim().toLowerCase())
            ));
            return {
              ...student,
              isCurrentUser,
              name: student.fullName,
              score: student.percentage
            };
          });
          
          setLeaderboardData(mappedData)
        } else {
          setLeaderboardData([])
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err)
        setLeaderboardData([])
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  const top5 = leaderboardData.slice(0, 5)
  const you = leaderboardData.find(s => s.isCurrentUser)
  const isYouInTop5 = top5.some(s => s.isCurrentUser)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up pb-12">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
        <p className="text-slate-500 mt-1">Top 5 Students of Your Batch</p>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Students</p>
            <p className="text-2xl font-bold text-slate-900">{leaderboardData.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Your Current Rank</p>
            <p className="text-2xl font-bold text-slate-900">{you ? `#${you.rank}` : 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Your Percentage</p>
            <p className="text-2xl font-bold text-slate-900">{you ? (you.hasAttempted === false ? '0%' : `${you.percentage}%`) : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Top 5 Leaderboard Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Rank', 'Student Name', 'PRN', 'Percentage', 'Accuracy'].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top5.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No leaderboard data available.</p>
                  </td>
                </tr>
              ) : (
                top5.map((student) => (
                  <tr key={student.rank} className={`${student.isCurrentUser ? 'bg-blue-50/50' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-lg">
                        {student.rank === 1 && <span title="Rank 1">🥇</span>}
                        {student.rank === 2 && <span title="Rank 2">🥈</span>}
                        {student.rank === 3 && <span title="Rank 3">🥉</span>}
                        {student.rank > 3 && <span className="text-slate-500 font-bold text-sm">#{student.rank}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {student.name}
                      {student.isCurrentUser && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">You</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">
                      {student.prn}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {student.percentage}%
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {student.accuracy}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Student Card */}
      {you && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center mt-8 relative overflow-hidden">
          {!isYouInTop5 && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl mb-8 max-w-xl mx-auto">
              <p className="text-lg font-bold mb-1">Your Rank: #{you.rank}</p>
              <p className="text-sm">(You are not in the Top 5.)</p>
              <p className="text-sm mt-2 font-medium">Keep practicing to improve your ranking.</p>
            </div>
          )}

          <h3 className="text-xl font-bold text-slate-800 mb-6">Your Performance</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center divide-x divide-slate-100 border border-slate-100 rounded-xl py-6 bg-slate-50/50">
            <div className="px-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</p>
              <p className="font-bold text-slate-800">{you.name}</p>
            </div>
            <div className="px-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">PRN</p>
              <p className="font-mono text-sm font-semibold text-slate-600 mt-0.5">{you.prn}</p>
            </div>
            <div className="px-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Rank</p>
              <p className="font-bold text-blue-600 text-lg">#{you.rank}</p>
            </div>
            <div className="px-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Percentage</p>
              <p className="font-bold text-slate-800 text-lg">{you.percentage}%</p>
            </div>
            <div className="px-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Accuracy</p>
              <p className="font-bold text-slate-800 text-lg">{you.accuracy}%</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
