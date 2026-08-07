import { useState, useEffect } from 'react'
import {
  Filter, Trash2,
  ChevronDown, GraduationCap, CheckCircle2,
  XCircle, Loader2, Users, Upload, FileSpreadsheet
} from 'lucide-react'
import api from '../../services/api'

const statuses = ['All Status', 'Active', 'Suspended']

export default function StudentManagement() {
  const [students, setStudents] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState('All Status')
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Suspend Modal State
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [suspendTarget, setSuspendTarget] = useState<string | string[] | null>(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [isSuspending, setIsSuspending] = useState(false)

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [uploadError, setUploadError] = useState('')

  // Batch State (Upload)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')

  // Table Filter State
  const [filterCourse, setFilterCourse] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')

  const startYear = 2022;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: (currentYear - startYear) + 6 }, (_, i) => startYear + i);

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/students?pageSize=1000') // Fetch all for simplicity
      if (res.data.success && res.data.data.data.length > 0) {
        setStudents(res.data.data.data)
      } else {
        setStudents([])
      }
    } catch (err) {
      console.error(err)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const isFilterComplete = filterCourse && filterMonth && filterYear;
  const targetBatch = `${filterMonth} - ${filterYear}`;

  const filtered = !isFilterComplete ? [] : students.filter(s => {
    if (s.courseName !== filterCourse) return false;
    if (s.batchName !== targetBatch) return false;

    if (filterStatus === 'All Status') return true
    if (filterStatus === 'Active') return s.isActive
    if (filterStatus === 'Suspended') return !s.isActive
    return true
  })

  const handleSuspendClick = (id: string) => {
    setSuspendTarget(id)
    setSuspendReason('')
    setSuspendModalOpen(true)
  }

  const confirmSuspend = async () => {
    if (!suspendTarget) return
    setIsSuspending(true)
    try {
      if (Array.isArray(suspendTarget)) {
        await api.patch('/admin/students/bulk/suspend', { studentIds: suspendTarget, reason: suspendReason })
        alert(`${suspendTarget.length} students suspended successfully.`)
        setSelectedIds([])
      } else {
        await api.patch(`/admin/students/${suspendTarget}/suspend`, { reason: suspendReason })
      }
      setSuspendModalOpen(false)
      fetchStudents()
    } catch (err) {
      console.error(err)
      alert("Failed to suspend student(s)")
    } finally {
      setIsSuspending(false)
    }
  }

  const activateStudent = async (id: string) => {
    if (!window.confirm("Are you sure you want to activate this student?\nThe student will be able to log in again.")) return
    try {
      await api.patch(`/admin/students/${id}/activate`)
      fetchStudents()
    } catch (err) {
      console.error(err)
      alert("Failed to activate student")
    }
  }

  const deleteStudent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this student?\nThis action cannot be undone.")) return
    try {
      await api.delete(`/admin/students/${id}`)
      setSelectedIds(prev => prev.filter(selId => selId !== id))
      fetchStudents()
    } catch (err) {
      console.error(err)
      alert("Failed to delete student")
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = filtered.map(s => s.id)
      const newSelected = [...new Set([...selectedIds, ...visibleIds])]
      setSelectedIds(newSelected)
    } else {
      const visibleIds = new Set(filtered.map(s => s.id))
      setSelectedIds(selectedIds.filter(id => !visibleIds.has(id)))
    }
  }

  const handleSelectOne = (e: React.SyntheticEvent, id: string) => {
    e.stopPropagation()
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selId => selId !== id) : [...prev, id])
  }

  const handleRowClick = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selId => selId !== id) : [...prev, id])
  }

  const handleBulkSuspendClick = () => {
    setSuspendTarget(selectedIds)
    setSuspendReason('')
    setSuspendModalOpen(true)
  }

  const bulkActivate = async () => {
    if (!window.confirm(`Are you sure you want to activate ${selectedIds.length} selected students?`)) return
    try {
      await api.patch('/admin/students/bulk/activate', { studentIds: selectedIds })
      fetchStudents()
      alert(`${selectedIds.length} students activated successfully.`)
    } catch (err) {
      console.error(err)
      alert("Failed to activate students")
    }
  }

  const bulkDelete = async () => {
    if (!window.confirm(`WARNING\n\nYou are about to delete ${selectedIds.length} students.\nThis action cannot be undone.\n\nDo you want to continue?`)) return
    try {
      await api.delete('/admin/students/bulk', { data: { studentIds: selectedIds } })
      setSelectedIds([])
      fetchStudents()
      alert(`${selectedIds.length} students deleted successfully.`)
    } catch (err) {
      console.error(err)
      alert("Failed to delete students")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        setUploadFile(file)
        setUploadError('')
      } else {
        setUploadError('Please select a valid Excel file (.xls, .xlsx)')
        setUploadFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadError('Please select a file first.')
      return
    }
    setUploading(true)
    setUploadError('')
    setUploadResult(null)

    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('batchName', `${selectedMonth} - ${selectedYear}`)
    formData.append('courseName', selectedCourse)

    try {
      const res = await api.post('/admin/students/upload', formData)
      setUploadResult(res.data)
      fetchStudents()
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to upload students.')
    } finally {
      setUploading(false)
    }
  }

  const closeUploadModal = () => {
    setShowUploadModal(false)
    setUploadFile(null)
    setUploadResult(null)
    setUploadError('')
    setSelectedMonth('')
    setSelectedYear('')
    setSelectedCourse('')
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">{students.length} students enrolled</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Upload className="w-4 h-4" /> Add Students
        </button>
      </div>

      {/* Stats */}
      {isFilterComplete && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total',     value: filtered.length,                                      color: 'text-primary-600', bg: 'bg-primary-50'  },
            { label: 'Active',    value: filtered.filter(s => s.isActive).length,   color: 'text-emerald-600', bg: 'bg-emerald-50'  },
            { label: 'Suspended', value: filtered.filter(s => !s.isActive).length,color: 'text-red-600',     bg: 'bg-red-50'      },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <GraduationCap className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-4 border-b border-slate-100 pb-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Select Course</label>
            <select 
              value={filterCourse} 
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary-500"
            >
              <option value="">Choose Course...</option>
              <option value="PGCP - AC">PGCP - AC</option>
              <option value="PGCP - AI">PGCP - AI</option>
              <option value="PGCP - BDA">PGCP - BDA</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Month</label>
            <select 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary-500"
            >
              <option value="">Choose Month...</option>
              <option value="Feb">February (Feb)</option>
              <option value="Aug">August (Aug)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Year</label>
            <select 
              value={filterYear} 
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary-500"
            >
              <option value="">Choose Year...</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {isFilterComplete && (
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="input-field pr-8 appearance-none cursor-pointer"
              >
                {statuses.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded-md text-sm">{selectedIds.length}</span>
            <span className="text-blue-900 font-medium text-sm">Students Selected</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleBulkSuspendClick} className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm font-medium transition-colors">
              Suspend Selected
            </button>
            <button onClick={bulkActivate} className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm font-medium transition-colors">
              Activate Selected
            </button>
            <button onClick={bulkDelete} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors">
              Delete Selected
            </button>
            <div className="w-px h-6 bg-blue-200 mx-1"></div>
            <button onClick={() => setSelectedIds([])} className="px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors">
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                <th className="px-5 py-3.5 w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    onChange={handleSelectAll}
                    checked={filtered.length > 0 && filtered.every(s => selectedIds.includes(s.id))}
                    ref={input => { if (input) input.indeterminate = filtered.some(s => selectedIds.includes(s.id)) && !filtered.every(s => selectedIds.includes(s.id)) }}
                  />
                </th>
                {['Student', 'PRN', 'Email', 'Batch', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {!isFilterComplete ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 text-base font-semibold mb-1">Select Batch Details</p>
                    <p className="text-slate-500 text-sm">Please select a Course, Month, and Year above to view the student list.</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No students found for this batch.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(student => (
                  <tr 
                    key={student.id} 
                    className={`hover:bg-surface-50 transition-colors group cursor-pointer ${selectedIds.includes(student.id) ? 'bg-blue-50/50' : ''}`}
                    onClick={() => handleRowClick(student.id)}
                  >
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        checked={selectedIds.includes(student.id)}
                        onChange={(e) => handleSelectOne(e, student.id)}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-700 text-xs font-bold">{student.fullName?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-800">{student.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-slate-600">{student.prn || 'N/A'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-500">{student.email}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge bg-primary-50 text-primary-700">{student.batchName || 'Unassigned'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {student.isActive
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          : <XCircle className="w-4 h-4 text-red-500" />
                        }
                        <span className={`text-xs font-medium ${
                          student.isActive ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {student.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-500">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2 transition-opacity">
                        {student.isActive ? (
                          <button
                            onClick={() => handleSuspendClick(student.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 font-medium text-xs transition-colors"
                          >
                            Suspend
                          </button>
                        ) : (
                          <>
                            {student.suspensionReason && (
                              <button
                                onClick={() => alert(`Suspension Reason:\n${student.suspensionReason}`)}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-xs transition-colors"
                              >
                                Reason
                              </button>
                            )}
                            <button
                              onClick={() => activateStudent(student.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium text-xs transition-colors"
                            >
                              Activate
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteStudent(student.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Add Students</h2>
              <button onClick={closeUploadModal} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6">
              {!uploadResult ? (
                <>
                  <div className="mb-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">1. Select Course & Batch <span className="text-red-500">*</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Course</label>
                        <select 
                          value={selectedCourse} 
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="" disabled>Select Course</option>
                          <option value="PGCP - AC">PGCP - AC</option>
                          <option value="PGCP - AI">PGCP - AI</option>
                          <option value="PGCP - BDA">PGCP - BDA</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Month</label>
                        <select 
                          value={selectedMonth} 
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="" disabled>Select Month</option>
                          <option value="Feb">February (Feb)</option>
                          <option value="Aug">August (Aug)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Year</label>
                        <select 
                          value={selectedYear} 
                          onChange={(e) => setSelectedYear(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="" disabled>Select Year</option>
                          {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {selectedCourse && selectedMonth && selectedYear && (
                      <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100 flex items-center justify-center text-center">
                        <p className="text-sm text-primary-800 font-medium">Target: <span className="font-bold">{selectedCourse}</span> ({selectedMonth} - {selectedYear})</p>
                      </div>
                    )}
                  </div>

                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${selectedCourse && selectedMonth && selectedYear ? 'border-primary-300 bg-primary-50/30' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
                    <FileSpreadsheet className={`w-12 h-12 mx-auto mb-4 ${selectedCourse && selectedMonth && selectedYear ? 'text-primary-500' : 'text-slate-300'}`} />
                    <p className="text-sm font-medium mb-1 text-slate-600">2. Upload Student Excel</p>
                    <p className="text-xs text-slate-500 mb-4">or click to browse (.xls, .xlsx)</p>
                    <input 
                      type="file" 
                      accept=".xls,.xlsx,.csv" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      id="file-upload" 
                      disabled={!selectedCourse || !selectedMonth || !selectedYear}
                    />
                    <label 
                      htmlFor="file-upload" 
                      className={`inline-block px-4 py-2 bg-white border rounded-lg text-sm font-medium transition-colors ${selectedCourse && selectedMonth && selectedYear ? 'border-primary-200 text-primary-700 hover:bg-primary-50 cursor-pointer shadow-sm' : 'border-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      {uploadFile ? uploadFile.name : 'Select File'}
                    </label>
                  </div>

                  {uploadError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-start gap-2">
                      <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={closeUploadModal} className="px-5 py-2.5 rounded-xl border font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button 
                      onClick={handleUpload} 
                      disabled={!uploadFile || uploading || !selectedCourse || !selectedMonth || !selectedYear} 
                      className="px-5 py-2.5 rounded-xl bg-primary-600 font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading ? 'Importing...' : 'Import Students'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-emerald-800">Upload Complete</h3>
                      <p className="text-sm text-emerald-700 mt-1">Processed {uploadResult.totalRows} rows from the Excel file.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{uploadResult.successfulRecords}</p>
                      <p className="text-xs font-medium text-slate-500 uppercase mt-1">Successful</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                      <p className="text-2xl font-bold text-red-600">{uploadResult.failedRecords}</p>
                      <p className="text-xs font-medium text-slate-500 uppercase mt-1">Failed</p>
                    </div>
                  </div>

                  {uploadResult.duplicatePrns?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Duplicate PRNs Found:</p>
                      <div className="flex flex-wrap gap-2">
                        {uploadResult.duplicatePrns.map((prn: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded border border-red-100">{prn}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {uploadResult.errors?.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2 text-xs text-slate-500">Row</th>
                            <th className="px-3 py-2 text-xs text-slate-500">Error</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {uploadResult.errors.map((e: any, i: number) => (
                            <tr key={i}>
                              <td className="px-3 py-2 text-slate-600 font-mono text-xs">{e.row}</td>
                              <td className="px-3 py-2 text-red-600 text-xs">{e.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex justify-end mt-6">
                    <button onClick={closeUploadModal} className="px-5 py-2.5 rounded-xl bg-slate-900 font-medium text-white hover:bg-slate-800">Done</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Suspend Student(s)</h3>
              <button onClick={() => setSuspendModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Please select a reason for suspension. {Array.isArray(suspendTarget) ? 'These students' : 'The student'} will not be able to log in until activated again.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Suspension <span className="text-red-500">*</span></label>
                <select 
                  value={suspendReason} 
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary-500"
                >
                  <option value="">Select Reason...</option>
                  <option value="Low Attendance">Low Attendance</option>
                  <option value="Fee Payment Pending">Fee Payment Pending</option>
                  <option value="Disciplinary Violation">Disciplinary Violation</option>
                  <option value="Academic Performance Issues">Academic Performance Issues</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setSuspendModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSuspend}
                disabled={!suspendReason || isSuspending}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSuspending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
