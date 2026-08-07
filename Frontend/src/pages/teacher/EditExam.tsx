import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ClipboardList, Calendar, Clock,
  BookOpen, Layers, CheckCircle2,
  ChevronLeft, Save, Plus, Trash2,
  Edit2, Upload, AlertCircle, X,
  ChevronDown, Settings, HelpCircle, Loader2
} from 'lucide-react'
import { teacherService } from '../../services/teacherService'

interface Question {
  id?: number | string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: number | string // can be 0-3 or 'A'-'D'
  explanation: string
}

export default function EditExam() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Settings
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedBatchId, setSelectedBatchId] = useState<number | string>('')
  const [duration, setDuration] = useState(60)
  const [examDate, setExamDate] = useState('')
  const [examTime, setExamTime] = useState('')
  const [examMode, setExamMode] = useState<'Scheduled' | 'Manual'>('Scheduled')
  const [shuffleQuestions, setShuffleQuestions] = useState(true)
  const [shuffleOptions, setShuffleOptions] = useState(true)
  const [maxViolations, setMaxViolations] = useState(3)

  // Questions
  const [questions, setQuestions] = useState<Question[]>([])
  const [isManualEntry, setIsManualEntry] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  // Lists
  const [batchesList, setBatchesList] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadExamAndBatches = async () => {
      try {
        // Fetch batches
        const batchesRes = await teacherService.getBatches()
        if (batchesRes?.success) {
          const validBatches = batchesRes.data.filter((b: any) => {
            const name = b.name || b.Name
            return name && /^(Feb|Aug)[-\s](20)?[2-3][0-9]$/i.test(name.trim())
          })
          setBatchesList(validBatches)
        }

        // Fetch exam details
        if (id) {
          const examRes = await teacherService.getExam(Number(id))
          if (examRes?.success) {
            const exam = examRes.data
            setTitle(exam.title)
            setDescription(exam.description || '')
            setSelectedBatchId(exam.batchId)
            setDuration(exam.durationMinutes)
            setExamMode(exam.status === 'Scheduled' ? 'Scheduled' : 'Manual')
            setShuffleQuestions(exam.shuffleQuestions)
            setShuffleOptions(exam.shuffleOptions)
            setMaxViolations(exam.maxViolations)
            
            // Format date and time
            const dateObj = new Date(exam.scheduledAt)
            const yyyy = dateObj.getFullYear()
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
            const dd = String(dateObj.getDate()).padStart(2, '0')
            setExamDate(`${yyyy}-${mm}-${dd}`)
            setExamTime(dateObj.toTimeString().substring(0, 5))

            // Map questions
            setQuestions(exam.questions || [])
          }
        }
      } catch (err) {
        console.error(err)
        alert('Failed to load exam data.')
      } finally {
        setLoading(false)
      }
    }

    loadExamAndBatches()
  }, [id])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return

      const lines = text.split('\n')
      const parsed: Question[] = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const parts = line.split(',')
        if (parts.length >= 6) {
          const rawCorrect = parts[5]?.trim().toUpperCase()
          const correctVal = rawCorrect === 'A' ? 0 : rawCorrect === 'B' ? 1 : rawCorrect === 'C' ? 2 : rawCorrect === 'D' ? 3 : 0
          
          parsed.push({
            questionText: parts[0]?.trim() || '',
            optionA: parts[1]?.trim() || '',
            optionB: parts[2]?.trim() || '',
            optionC: parts[3]?.trim() || '',
            optionD: parts[4]?.trim() || '',
            correctOption: correctVal,
            explanation: parts[6]?.trim() || ''
          })
        }
      }
      setQuestions(prev => [...prev, ...parsed])
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  const saveManualQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    
    const correctLetter = fd.get('correctOption') as string
    const correctVal = correctLetter === 'A' ? 0 : correctLetter === 'B' ? 1 : correctLetter === 'C' ? 2 : 3

    const newQ: Question = {
      id: editingQuestion?.id || undefined,
      questionText: fd.get('questionText') as string,
      optionA: fd.get('optionA') as string,
      optionB: fd.get('optionB') as string,
      optionC: fd.get('optionC') as string,
      optionD: fd.get('optionD') as string,
      correctOption: correctVal,
      explanation: fd.get('explanation') as string,
    }

    if (editingQuestion && editingQuestion.id) {
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? newQ : q))
    } else if (editingQuestion) {
      // In-memory update before save
      setQuestions(prev => prev.map((q, idx) => idx === (editingQuestion as any)._index ? newQ : q))
    } else {
      setQuestions(prev => [...prev, newQ])
    }

    setIsManualEntry(false)
    setEditingQuestion(null)
  }

  const deleteQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleSaveExam = async () => {
    if (!title || !selectedBatchId || !examDate || !examTime) {
      alert('Please fill in all required fields.')
      return
    }

    if (questions.length === 0) {
      alert('Please add at least one question.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        id: Number(id),
        title,
        description,
        batchId: Number(selectedBatchId),
        scheduledAt: new Date(`${examDate}T${examTime}`).toISOString(),
        durationMinutes: duration,
        status: examMode === 'Scheduled' ? 'Scheduled' : 'Draft',
        shuffleQuestions,
        shuffleOptions,
        maxViolations,
        questions: questions.map(q => ({
          id: q.id ? Number(q.id) : null,
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: typeof q.correctOption === 'string'
            ? (q.correctOption === 'A' ? 0 : q.correctOption === 'B' ? 1 : q.correctOption === 'C' ? 2 : 3)
            : q.correctOption,
          explanation: q.explanation || ''
        }))
      }

      const res = await teacherService.updateExam(Number(id), payload)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/teacher/dashboard')
        }, 2000)
      } else {
        alert(res.message || 'Failed to update exam')
      }
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.message || 'Error updating exam')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-slate-200 animate-slide-up">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 font-serif">Exam Updated Successfully!</h2>
          <p className="text-slate-500 text-sm">All changes have been saved to the database.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/teacher/dashboard')} 
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Edit Exam</h1>
            <p className="text-slate-500 text-xs mt-0.5">Modify settings and questions for your live exam.</p>
          </div>
        </div>
        <button
          onClick={handleSaveExam}
          disabled={saving}
          className="btn-primary flex items-center gap-2 shadow-sm font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'settings' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          Exam Settings
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'questions' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Manage Questions ({questions.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'settings' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Core Java Unit Test - 3" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea 
                rows={2} 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Brief description of the exam..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned Batch *</label>
              <div className="relative">
                <select
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-slate-700 cursor-pointer"
                >
                  <option value="">Select a batch...</option>
                  {batchesList.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (Minutes) *</label>
              <input 
                type="number" 
                value={duration} 
                onChange={e => setDuration(Number(e.target.value))} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Date *</label>
              <input 
                type="date" 
                value={examDate} 
                onChange={e => setExamDate(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Time *</label>
              <input 
                type="time" 
                value={examTime} 
                onChange={e => setExamTime(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Availability Mode *</label>
              <select 
                value={examMode} 
                onChange={e => setExamMode(e.target.value as any)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
              >
                <option value="Scheduled">Scheduled Mode (Auto Start/Stop)</option>
                <option value="Manual">Manual Mode (Teacher Controlled)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Max Violations Allowed *</label>
              <input 
                type="number" 
                value={maxViolations} 
                onChange={e => setMaxViolations(Number(e.target.value))} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div className="flex items-center gap-6 mt-4 md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={shuffleQuestions} 
                  onChange={e => setShuffleQuestions(e.target.checked)} 
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer" 
                />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">Shuffle Questions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={shuffleOptions} 
                  onChange={e => setShuffleOptions(e.target.checked)} 
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer" 
                />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">Shuffle Options</span>
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button 
              onClick={() => { setEditingQuestion(null); setIsManualEntry(true) }} 
              className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full sm:w-auto btn-secondary flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload CSV
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".csv" 
              className="hidden" 
            />
            <p className="text-slate-400 text-xs font-semibold sm:ml-auto">
              Uploading a CSV appends questions to the current list.
            </p>
          </div>

          {/* Question Form Overlays / Modals */}
          {isManualEntry && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="font-bold text-slate-800">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h4>
                <button onClick={() => { setIsManualEntry(false); setEditingQuestion(null) }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={saveManualQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Question Text</label>
                  <textarea name="questionText" required rows={2} defaultValue={editingQuestion?.questionText} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Option A</label>
                    <input name="optionA" defaultValue={editingQuestion?.optionA} required type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Option B</label>
                    <input name="optionB" defaultValue={editingQuestion?.optionB} required type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Option C</label>
                    <input name="optionC" defaultValue={editingQuestion?.optionC} required type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Option D</label>
                    <input name="optionD" defaultValue={editingQuestion?.optionD} required type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Correct Answer</label>
                    <select name="correctOption" defaultValue={editingQuestion ? (editingQuestion.correctOption === 0 ? 'A' : editingQuestion.correctOption === 1 ? 'B' : editingQuestion.correctOption === 2 ? 'C' : 'D') : 'A'} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer">
                      <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Explanation (Optional)</label>
                    <input name="explanation" defaultValue={editingQuestion?.explanation} type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex gap-3 pt-3 border-t border-slate-200">
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors text-sm">Save Question</button>
                  <button type="button" onClick={() => { setIsManualEntry(false); setEditingQuestion(null) }} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 shadow-sm transition-colors text-sm">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const correctLetter = q.correctOption === 0 ? 'A' : q.correctOption === 1 ? 'B' : q.correctOption === 2 ? 'C' : q.correctOption === 3 ? 'D' : q.correctOption
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 flex gap-4 group hover:border-slate-300 transition-colors shadow-sm animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 text-xs font-black">
                    Q{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm leading-snug">{q.questionText}</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-3 text-xs text-slate-500 font-medium">
                      <span className={q.correctOption === 0 ? 'text-emerald-600 font-bold' : ''}>A: {q.optionA}</span>
                      <span className={q.correctOption === 1 ? 'text-emerald-600 font-bold' : ''}>B: {q.optionB}</span>
                      <span className={q.correctOption === 2 ? 'text-emerald-600 font-bold' : ''}>C: {q.optionC}</span>
                      <span className={q.correctOption === 3 ? 'text-emerald-600 font-bold' : ''}>D: {q.optionD}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                      <span>Correct Option: <b className="text-emerald-600 text-sm">{correctLetter}</b></span>
                      {q.explanation && <span>• Explanation: <i>{q.explanation}</i></span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingQuestion({ ...q, _index: idx } as any); setIsManualEntry(true) }} 
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => deleteQuestion(idx)} 
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
            
            {questions.length === 0 && (
              <div className="card text-center py-12">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-bold text-sm">No questions in this exam yet.</p>
                <p className="text-slate-400 text-xs mt-1">Add questions manually or upload a CSV file to begin.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
