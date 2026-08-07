import { useState, useEffect } from 'react'
import {
  Brain, Plus, Edit3, Trash2, Save, X, ChevronRight,
  Clock, BookOpen, Bookmark, List, ArrowLeft, AlertTriangle,
  RefreshCw, BarChart2, CheckCircle2, XCircle, Tag, Layers,
  AlertCircle, Upload
} from 'lucide-react'
import { mcqService } from '../../services/mcqService'



// ─── MCQ Question form shape ───────────────────────────────────────────────
const EMPTY_QUESTION = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 0,
  explanation: '',
  difficulty: 'Easy',
  marks: 1,
  topicId: 0,
  subTopicId: null as number | null,
  status: 'Active'
}

export default function TeacherPractice() {


  // ─── Shared Data ──────────────────────────────────────────────────────────
  const [modules, setModules] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [globalMsg, setGlobalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // ── CSV Upload ────────────────────────────────────────────────────────────
  const [showCsvModal, setShowCsvModal] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<any[]>([])
  const [csvDifficulty, setCsvDifficulty] = useState('Easy')
  const [csvMarks, setCsvMarks] = useState(1)
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvError, setCsvError] = useState('')

  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvError('Please upload a .csv file.')
      return
    }
    setCsvError('')
    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length < 2) {
        setCsvError('CSV seems empty or missing headers.')
        return
      }

      const parsed = lines.slice(1).map(line => {
        let inQuote = false
        let val = ''
        const row = []
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuote = !inQuote
          } else if (char === ',' && !inQuote) {
            row.push(val.trim())
            val = ''
          } else {
            val += char
          }
        }
        row.push(val.trim())

        return {
          questionText: row[0] || '',
          optionA: row[1] || '',
          optionB: row[2] || '',
          optionC: row[3] || '',
          optionD: row[4] || '',
          correctOptionRaw: row[5] || ''
        }
      })

      const validated = parsed.filter(p => p.questionText && p.optionA && p.correctOptionRaw)
      setCsvPreview(validated)
    }
    reader.readAsText(file)
  }

  const mapCorrectOption = (raw: string) => {
    const r = raw.trim().toUpperCase()
    if (r === 'A' || r === 'OPTION A') return 0
    if (r === 'B' || r === 'OPTION B') return 1
    if (r === 'C' || r === 'OPTION C') return 2
    if (r === 'D' || r === 'OPTION D') return 3
    return 0 // Default
  }

  const confirmCsvImport = async () => {
    if (!mgrTopic || csvPreview.length === 0) return
    setCsvLoading(true)
    let successCount = 0
    for (const q of csvPreview) {
      try {
        await mcqService.addQuestion({
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: mapCorrectOption(q.correctOptionRaw),
          difficulty: csvDifficulty,
          marks: csvMarks,
          topicId: mgrTopic.id,
          subTopicId: null
        })
        successCount++
      } catch (e) {
        console.error(e)
      }
    }
    setCsvLoading(false)
    setShowCsvModal(false)
    showMsg('success', `Imported ${successCount} questions successfully!`)
    if (mgrTopic) loadQuestions(mgrTopic.id)
  }

  const removePreviewRow = (idx: number) => {
    setCsvPreview(prev => prev.filter((_, i) => i !== idx))
  }

  const showMsg = (type: 'success' | 'error', text: string) => {
    setGlobalMsg({ type, text })
    setTimeout(() => setGlobalMsg(null), 4000)
  }

  const loadModules = async () => {
    setLoadingData(true)
    try {
      const res = await mcqService.getModules()
      setModules(res || [])
    } catch (e) { console.error(e) }
    finally { setLoadingData(false) }
  }

  useEffect(() => { loadModules() }, [])

  // ═══════════════════════════════════════════════════════════════════════════
  //  MCQ MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Subjects (Modules) ────────────────────────────────────────────────────
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '' })
  const [editingSubject, setEditingSubject] = useState<any | null>(null)
  const [subjectLoading, setSubjectLoading] = useState(false)

  const saveSubject = async () => {
    if (!subjectForm.name.trim()) return
    setSubjectLoading(true)
    try {
      if (editingSubject) {
        await mcqService.updateModule(editingSubject.id, subjectForm)
        showMsg('success', 'Subject updated.')
      } else {
        await mcqService.addModule(subjectForm)
        showMsg('success', 'Subject created.')
      }
      setEditingSubject(null)
      setSubjectForm({ name: '', description: '' })
      await loadModules()
    } catch (e) { showMsg('error', 'Failed to save subject.') }
    setSubjectLoading(false)
  }

  const deleteSubject = async (id: number) => {
    if (!confirm('Delete this subject and all its topics/questions?')) return
    try {
      await mcqService.deleteModule(id)
      showMsg('success', 'Subject deleted.')
      await loadModules()
    } catch (e) { showMsg('error', 'Failed to delete subject.') }
  }

  // ── Topics ────────────────────────────────────────────────────────────────
  const [mgrModule, setMgrModule] = useState<any | null>(null)   // selected module in manager
  const [mgrTopic, setMgrTopic] = useState<any | null>(null)     // selected topic in manager
  const [mgrSubTopic, setMgrSubTopic] = useState<any | null>(null)

  const [topics, setTopics] = useState<any[]>([])
  const [topicForm, setTopicForm] = useState({ name: '', moduleId: 0 })
  const [editingTopic, setEditingTopic] = useState<any | null>(null)
  const [topicLoading, setTopicLoading] = useState(false)

  const loadTopics = async (moduleId: number) => {
    setTopicLoading(true)
    try {
      const res = await mcqService.getTopics(moduleId)
      setTopics(res || [])
    } catch (e) { console.error(e) }
    setTopicLoading(false)
  }

  const saveTopic = async () => {
    if (!topicForm.name.trim() || !mgrModule) return
    setTopicLoading(true)
    try {
      const payload = { name: topicForm.name, moduleId: mgrModule.id }
      if (editingTopic) {
        await mcqService.updateTopic(editingTopic.id, payload)
        showMsg('success', 'Topic updated.')
      } else {
        await mcqService.addTopic(payload)
        showMsg('success', 'Topic created.')
      }
      setEditingTopic(null)
      setTopicForm({ name: '', moduleId: mgrModule.id })
      await loadTopics(mgrModule.id)
    } catch (e) { showMsg('error', 'Failed to save topic.') }
    setTopicLoading(false)
  }

  const deleteTopic = async (id: number) => {
    if (!confirm('Delete this topic and all its questions?')) return
    try {
      await mcqService.deleteTopic(id)
      showMsg('success', 'Topic deleted.')
      if (mgrModule) await loadTopics(mgrModule.id)
    } catch (e) { showMsg('error', 'Failed to delete topic.') }
  }

  // ── Sub-Topics ────────────────────────────────────────────────────────────
  const [subTopics, setSubTopics] = useState<any[]>([])
  const [subTopicForm, setSubTopicForm] = useState({ name: '', topicId: 0 })
  const [editingSubTopic, setEditingSubTopic] = useState<any | null>(null)
  const [subTopicLoading, setSubTopicLoading] = useState(false)

  const loadSubTopics = async (topicId: number) => {
    setSubTopicLoading(true)
    try {
      const res = await mcqService.getSubTopics(topicId)
      setSubTopics(res || [])
    } catch (e) { console.error(e) }
    setSubTopicLoading(false)
  }

  const saveSubTopic = async () => {
    if (!subTopicForm.name.trim() || !mgrTopic) return
    setSubTopicLoading(true)
    try {
      const payload = { name: subTopicForm.name, topicId: mgrTopic.id }
      if (editingSubTopic) {
        await mcqService.updateSubTopic(editingSubTopic.id, payload)
        showMsg('success', 'Sub-topic updated.')
      } else {
        await mcqService.addSubTopic(payload)
        showMsg('success', 'Sub-topic created.')
      }
      setEditingSubTopic(null)
      setSubTopicForm({ name: '', topicId: mgrTopic.id })
      await loadSubTopics(mgrTopic.id)
    } catch (e) { showMsg('error', 'Failed to save sub-topic.') }
    setSubTopicLoading(false)
  }

  const deleteSubTopic = async (id: number) => {
    if (!confirm('Delete this sub-topic?')) return
    try {
      await mcqService.deleteSubTopic(id)
      showMsg('success', 'Sub-topic deleted.')
      if (mgrTopic) await loadSubTopics(mgrTopic.id)
    } catch (e) { showMsg('error', 'Failed to delete sub-topic.') }
  }

  // ── Difficulty Configs ──────────────────────────────────────────────────
  const [difficultyConfigs, setDifficultyConfigs] = useState<any[]>([])
  const [diffConfigLoading, setDiffConfigLoading] = useState(false)

  const loadDifficultyConfigs = async (topicId: number) => {
    setDiffConfigLoading(true)
    try {
      const res = await mcqService.getDifficultyConfigs(topicId)
      const data = Array.isArray(res) ? res : (Array.isArray((res as any)?.data) ? (res as any).data : [])
      const defaults = [
        { difficultyLevel: 'Easy', durationMinutes: 30, numberOfQuestions: 20, passingMarks: 10 },
        { difficultyLevel: 'Medium', durationMinutes: 30, numberOfQuestions: 20, passingMarks: 10 },
        { difficultyLevel: 'Hard', durationMinutes: 30, numberOfQuestions: 20, passingMarks: 10 },
      ]
      const merged = defaults.map(d => {
        const found = data.find((c: any) => c.difficultyLevel === d.difficultyLevel)
        return (found && typeof found === 'object') ? { ...d, ...found } : d
      })
      setDifficultyConfigs(merged)
    } catch (e) { console.error(e) }
    setDiffConfigLoading(false)
  }

  const saveDifficultyConfigs = async () => {
    if (!mgrTopic) return
    setDiffConfigLoading(true)
    try {
      await mcqService.updateDifficultyConfigs(mgrTopic.id, difficultyConfigs)
      showMsg('success', 'Difficulty configurations updated.')
    } catch (e) { showMsg('error', 'Failed to update configurations.') }
    setDiffConfigLoading(false)
  }

  // ── Questions ─────────────────────────────────────────────────────────────
  const [mgrQuestions, setMgrQuestions] = useState<any[]>([])
  const [questionForm, setQuestionForm] = useState({ ...EMPTY_QUESTION })
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null)
  const [questionLoading, setQuestionLoading] = useState(false)
  const [showQForm, setShowQForm] = useState(false)

  const loadQuestions = async (topicId: number) => {
    setQuestionLoading(true)
    try {
      const res = await mcqService.getQuestions({ topicId, page: 1, pageSize: 200 })
      setMgrQuestions(Array.isArray(res) ? res : res?.data || [])
    } catch (e) { console.error(e) }
    setQuestionLoading(false)
  }

  const openNewQuestion = () => {
    setEditingQuestion(null)
    setQuestionForm({
      ...EMPTY_QUESTION,
      topicId: mgrTopic?.id || 0,
      subTopicId: mgrSubTopic?.id || null
    })
    setShowQForm(true)
  }

  const openEditQuestion = (q: any) => {
    setEditingQuestion(q)
    setQuestionForm({
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      explanation: q.explanation || '',
      difficulty: q.difficulty,
      marks: q.marks || 1,
      topicId: q.topicId,
      subTopicId: q.subTopicId || null,
      status: q.status || 'Active'
    })
    setShowQForm(true)
  }

  const saveQuestion = async () => {
    if (!questionForm.questionText.trim() || !questionForm.optionA.trim() || !questionForm.topicId) {
      showMsg('error', 'Question text, all options, and topic are required.')
      return
    }
    setQuestionLoading(true)
    try {
      if (editingQuestion) {
        await mcqService.updateQuestion(editingQuestion.id, questionForm)
        showMsg('success', 'Question updated.')
      } else {
        await mcqService.addQuestion(questionForm)
        showMsg('success', 'Question added.')
      }
      setShowQForm(false)
      if (mgrTopic) await loadQuestions(mgrTopic.id)
    } catch (e) { showMsg('error', 'Failed to save question.') }
    setQuestionLoading(false)
  }

  const deleteQuestion = async (id: number) => {
    if (!confirm('Delete this question?')) return
    try {
      await mcqService.deleteQuestion(id)
      showMsg('success', 'Question deleted.')
      if (mgrTopic) await loadQuestions(mgrTopic.id)
    } catch (e) { showMsg('error', 'Failed to delete question.') }
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-6xl mx-auto pb-12">
      {/* Global Message Banner */}
      {globalMsg && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-semibold flex items-center gap-2 animate-fade-in ${globalMsg.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}>
          {globalMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {globalMsg.text}
        </div>
      )}

      {/* Tab Bar */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          Question Bank For Practice MCQ
        </h1>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8 animate-fade-in">

        {/* ── SUBJECTS ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Brain className="w-5 h-5" /> Subjects (Modules)
            </h2>
          </div>

          {/* Add / Edit Subject Form */}
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <p className="text-sm font-semibold text-slate-600 mb-3">
              {editingSubject ? `✏️ Editing: ${editingSubject.name}` : '➕ Add New Subject'}
            </p>
            <div className="flex gap-3 flex-wrap">
              <input
                value={subjectForm.name}
                onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Subject name (e.g., Java, DBMS)"
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                value={subjectForm.description}
                onChange={e => setSubjectForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={saveSubject}
                disabled={subjectLoading || !subjectForm.name.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> {editingSubject ? 'Update' : 'Add Subject'}
              </button>
              {editingSubject && (
                <button
                  onClick={() => { setEditingSubject(null); setSubjectForm({ name: '', description: '' }) }}
                  className="px-4 py-2.5 bg-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-300 flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              )}
            </div>
          </div>

          {/* Subject list */}
          <div className="divide-y divide-slate-100">
            {loadingData ? (
              <div className="py-8 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline mr-2" /> Loading...</div>
            ) : modules.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No subjects yet. Add one above.</div>
            ) : (
              modules.map(mod => (
                <div key={mod.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${mgrModule?.id === mod.id ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    <div>
                      <p className="font-semibold text-slate-800">{mod.name}</p>
                      {mod.description && <p className="text-xs text-slate-400 mt-0.5">{mod.description}</p>}
                      <p className="text-xs text-slate-400">{mod.topics?.length || 0} topics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setMgrModule(mod)
                        setMgrTopic(null)
                        setMgrSubTopic(null)
                        setTopics([])
                        setSubTopics([])
                        setMgrQuestions([])
                        loadTopics(mod.id)
                      }}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${mgrModule?.id === mod.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                    >
                      <ChevronRight className="w-4 h-4" /> Manage Topics
                    </button>
                    <button
                      onClick={() => { setEditingSubject(mod); setSubjectForm({ name: mod.name, description: mod.description || '' }) }}
                      className="p-2 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSubject(mod.id)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── TOPICS (visible after subject selected) ────────────────────── */}
        {mgrModule && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-violet-600 to-violet-700 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <Tag className="w-5 h-5" /> Topics — <span className="font-normal">{mgrModule.name}</span>
              </h2>
            </div>

            {/* Topic form */}
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <p className="text-sm font-semibold text-slate-600 mb-3">
                {editingTopic ? `✏️ Editing: ${editingTopic.name}` : '➕ Add New Topic'}
              </p>
              <div className="flex gap-3 flex-wrap">
                <input
                  value={topicForm.name}
                  onChange={e => setTopicForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Topic name (e.g., OOP, SQL Joins)"
                  className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <button
                  onClick={saveTopic}
                  disabled={topicLoading || !topicForm.name.trim()}
                  className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {editingTopic ? 'Update' : 'Add Topic'}
                </button>
                {editingTopic && (
                  <button
                    onClick={() => { setEditingTopic(null); setTopicForm({ name: '', moduleId: mgrModule.id }) }}
                    className="px-4 py-2.5 bg-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-300 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Topic list */}
            <div className="divide-y divide-slate-100">
              {topicLoading ? (
                <div className="py-8 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline mr-2" /> Loading...</div>
              ) : topics.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No topics yet. Add one above.</div>
              ) : (
                topics.map(t => (
                  <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${mgrTopic?.id === t.id ? 'bg-violet-500' : 'bg-slate-200'}`} />
                      <p className="font-semibold text-slate-800">{t.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setMgrTopic(t)
                          setMgrSubTopic(null)
                          setSubTopics([])
                          setMgrQuestions([])
                          loadSubTopics(t.id)
                          loadQuestions(t.id)
                          loadDifficultyConfigs(t.id)
                        }}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${mgrTopic?.id === t.id ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700'
                          }`}
                      >
                        <ChevronRight className="w-4 h-4" /> Subtopics &amp; Questions
                      </button>
                      <button
                        onClick={() => { setEditingTopic(t); setTopicForm({ name: t.name, moduleId: mgrModule.id }) }}
                        className="p-2 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTopic(t.id)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── SUBTOPICS (visible after topic selected) ───────────────────── */}
        {mgrTopic && (
          <>
            {/* Difficulty Configs Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
              <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 flex justify-between items-center">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <BarChart2 className="w-5 h-5" /> Difficulty Settings — <span className="font-normal">{mgrTopic.name}</span>
                </h2>
                <button
                  onClick={saveDifficultyConfigs}
                  disabled={diffConfigLoading}
                  className="px-4 py-1.5 bg-white text-amber-700 rounded-lg font-semibold text-sm hover:bg-amber-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Settings
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {difficultyConfigs.map((config, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${config.difficultyLevel === 'Easy' ? 'bg-emerald-500' :
                        config.difficultyLevel === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                      {config.difficultyLevel} Level
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Duration (Minutes)</label>
                        <input type="number" min={1} value={config.durationMinutes}
                          onChange={e => {
                            const newConfigs = [...difficultyConfigs]
                            newConfigs[idx].durationMinutes = parseInt(e.target.value) || 0
                            setDifficultyConfigs(newConfigs)
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Max Questions</label>
                        <input type="number" min={1} value={config.numberOfQuestions}
                          onChange={e => {
                            const newConfigs = [...difficultyConfigs]
                            newConfigs[idx].numberOfQuestions = parseInt(e.target.value) || 0
                            setDifficultyConfigs(newConfigs)
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Passing Marks (Optional)</label>
                        <input type="number" min={0} value={config.passingMarks || ''}
                          onChange={e => {
                            const newConfigs = [...difficultyConfigs]
                            newConfigs[idx].passingMarks = e.target.value ? parseInt(e.target.value) : null
                            setDifficultyConfigs(newConfigs)
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5" /> Sub-Topics — <span className="font-normal">{mgrTopic.name}</span>
                </h2>
              </div>

              {/* SubTopic form */}
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-600 mb-3">
                  {editingSubTopic ? `✏️ Editing: ${editingSubTopic.name}` : '➕ Add New Sub-Topic'}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <input
                    value={subTopicForm.name}
                    onChange={e => setSubTopicForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Sub-topic name (e.g., Inheritance, Polymorphism)"
                    className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <button
                    onClick={saveSubTopic}
                    disabled={subTopicLoading || !subTopicForm.name.trim()}
                    className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> {editingSubTopic ? 'Update' : 'Add Sub-Topic'}
                  </button>
                  {editingSubTopic && (
                    <button
                      onClick={() => { setEditingSubTopic(null); setSubTopicForm({ name: '', topicId: mgrTopic.id }) }}
                      className="px-4 py-2.5 bg-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-300 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {subTopicLoading ? (
                  <div className="py-6 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline mr-2" /></div>
                ) : subTopics.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-sm">No sub-topics yet.</div>
                ) : (
                  subTopics.map(st => (
                    <div key={st.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                      <p className="font-medium text-slate-700">{st.name}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingSubTopic(st); setSubTopicForm({ name: st.name, topicId: mgrTopic.id }) }}
                          className="p-2 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteSubTopic(st.id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* ── QUESTIONS (visible after topic selected) ───────────────────── */}
        {mgrTopic && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-700 to-slate-800 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Questions — <span className="font-normal">{mgrTopic.name}</span>
                <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{mgrQuestions.length}</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={openNewQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold text-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Manual Entry
                </button>
                <button
                  onClick={() => { setShowCsvModal(true); setCsvPreview([]); setCsvFile(null); setCsvError('') }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all"
                >
                  <Upload className="w-4 h-4" /> Upload CSV
                </button>
              </div>
            </div>

            {/* Question form modal */}
            {showQForm && (
              <div className="p-6 border-b border-slate-200 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800">{editingQuestion ? 'Edit Question' : 'New Question'}</h3>
                  <button onClick={() => setShowQForm(false)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={questionForm.questionText}
                  onChange={e => setQuestionForm(f => ({ ...f, questionText: e.target.value }))}
                  placeholder="Question text..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map((letter, idx) => {
                    const key = `option${letter}` as 'optionA' | 'optionB' | 'optionC' | 'optionD'
                    return (
                      <div key={letter} className="relative">
                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${questionForm.correctOption === idx ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>{letter}</span>
                        <input
                          value={questionForm[key]}
                          onChange={e => setQuestionForm(f => ({ ...f, [key]: e.target.value }))}
                          placeholder={`Option ${letter}`}
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Correct Answer</label>
                    <select
                      value={questionForm.correctOption}
                      onChange={e => setQuestionForm(f => ({ ...f, correctOption: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Difficulty</label>
                    <select
                      value={questionForm.difficulty}
                      onChange={e => setQuestionForm(f => ({ ...f, difficulty: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Marks</label>
                    <input
                      type="number"
                      min={1}
                      value={questionForm.marks}
                      onChange={e => setQuestionForm(f => ({ ...f, marks: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Status</label>
                    <select
                      value={questionForm.status}
                      onChange={e => setQuestionForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                {subTopics.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Sub-Topic (optional)</label>
                    <select
                      value={questionForm.subTopicId || ''}
                      onChange={e => setQuestionForm(f => ({ ...f, subTopicId: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">None</option>
                      {subTopics.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                    </select>
                  </div>
                )}

                <textarea
                  value={questionForm.explanation}
                  onChange={e => setQuestionForm(f => ({ ...f, explanation: e.target.value }))}
                  placeholder="Explanation (optional)..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />

                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowQForm(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200">
                    Cancel
                  </button>
                  <button
                    onClick={saveQuestion}
                    disabled={questionLoading}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> {editingQuestion ? 'Update Question' : 'Save Question'}
                  </button>
                </div>
              </div>
            )}

            {/* CSV Upload Modal */}
            {showCsvModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                  <div className="px-6 py-4 bg-slate-800 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Upload className="w-5 h-5" /> Import Questions from CSV</h3>
                    <button onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1">
                    {!csvFile ? (
                      <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-slate-50">
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Upload CSV File</h4>
                        <p className="text-slate-500 mb-6">File must contain columns: Question, Option A, Option B, Option C, Option D, Correct Answer (A/B/C/D)</p>
                        <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition-colors inline-block">
                          Select .csv File
                          <input type="file" accept=".csv" className="hidden" onChange={handleCsvFile} />
                        </label>
                        {csvError && <p className="text-red-500 font-semibold mt-4">{csvError}</p>}
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div>
                            <p className="font-bold text-slate-800 flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              {csvFile.name}
                            </p>
                            <p className="text-sm text-slate-500">{csvPreview.length} questions parsed successfully.</p>
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <label className="text-xs font-semibold text-slate-500 block mb-1">Set Difficulty for all</label>
                              <select value={csvDifficulty} onChange={(e) => setCsvDifficulty(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500">
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-500 block mb-1">Marks per question</label>
                              <input type="number" min="1" value={csvMarks} onChange={(e) => setCsvMarks(parseInt(e.target.value) || 1)} className="w-20 px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500" />
                            </div>
                          </div>
                        </div>

                        {csvPreview.length > 0 ? (
                          <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="px-4 py-3">#</th>
                                  <th className="px-4 py-3 w-1/3">Question</th>
                                  <th className="px-4 py-3">Options</th>
                                  <th className="px-4 py-3">Correct</th>
                                  <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {csvPreview.map((q, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-xs" title={q.questionText}>{q.questionText}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">
                                      <div>A: {q.optionA}</div>
                                      <div>B: {q.optionB}</div>
                                      <div>C: {q.optionC}</div>
                                      <div>D: {q.optionD}</div>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-emerald-600">{q.correctOptionRaw}</td>
                                    <td className="px-4 py-3 text-center">
                                      <button onClick={() => removePreviewRow(idx)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-slate-500">
                            No valid questions found in this CSV. Please check the format.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {csvFile && csvPreview.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                      <button onClick={() => { setCsvFile(null); setCsvPreview([]) }} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={confirmCsvImport}
                        disabled={csvLoading}
                        className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {csvLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Import {csvPreview.length} Questions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Question list */}
            <div className="divide-y divide-slate-100">
              {questionLoading ? (
                <div className="py-8 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline mr-2" /> Loading questions...</div>
              ) : mgrQuestions.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No questions yet. Click <strong>Add Question</strong> above.</p>
                </div>
              ) : (
                mgrQuestions.map((q, i) => (
                  <div key={q.id} className="p-6 hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1">
                        <span className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 mb-2">{q.questionText}</p>
                          <div className="grid grid-cols-2 gap-1 text-sm">
                            {[q.optionA, q.optionB, q.optionC, q.optionD].map((opt, idx) => (
                              <span key={idx} className={`flex items-center gap-1 ${q.correctOption === idx ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${q.correctOption === idx ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                {opt}
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                              q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                              }`}>{q.difficulty}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                              }`}>{q.status}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openEditQuestion(q)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
