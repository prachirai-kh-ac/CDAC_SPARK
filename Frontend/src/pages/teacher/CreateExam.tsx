import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, BookOpen,
  ChevronRight, ChevronLeft, Check,
  AlertCircle, CheckCircle2
} from 'lucide-react'

import { teacherService } from '../../services/teacherService'
import { useAuth } from '../../context/AuthContext'

export default function CreateExam() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  // Step 1: Details
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [duration, setDuration] = useState(60)
  const [examDate, setExamDate] = useState('')
  const [examTime, setExamTime] = useState('')

  // Step 2: Module, Topics, Total Questions
  const [selectedModule, setSelectedModule] = useState<number | ''>('')
  const [selectedTopics, setSelectedTopics] = useState<number[]>([])
  const [totalQuestions, setTotalQuestions] = useState(20)
  const [topicDistribution, setTopicDistribution] = useState<Record<number, number>>({})

  const [modulesList, setModulesList] = useState<any[]>([])
  const [topicMap, setTopicMap] = useState<any>({})
  const [batchesList, setBatchesList] = useState<any[]>([{id: 'loading', name: 'Loading batches...'}])
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const batchesRes = await teacherService.getBatches()
        const batchesData = batchesRes?.success !== undefined ? batchesRes.data : batchesRes;
        if (Array.isArray(batchesData)) {
          setBatchesList(batchesData)
        } else {
          setBatchesList([{id: 'error', name: 'Failed to load batches'}])
        }
      } catch (err: any) {
        console.error("Batches error:", err)
        setBatchesList([{id: 'error', name: 'Error: ' + err.message}])
      }

      try {
        const modulesRes = await teacherService.getModules()
        // If the backend returns a flat array, modulesRes is the array itself
        const modulesData = modulesRes?.success !== undefined ? modulesRes.data : modulesRes;
        
        if (Array.isArray(modulesData)) {
          // Fix keys: backend uses moduleId, moduleName instead of id, name
          const formattedModules = modulesData.map((m: any) => ({
            id: m.moduleId || m.id,
            name: m.moduleName || m.name || m.Name,
            topics: m.topics || m.Topics || [] // Assuming topics are returned here, or we need to fetch them
          }));
          
          setModulesList(formattedModules)
          const map: any = {}
          formattedModules.forEach((m: any) => {
            map[m.id] = m.topics
          })
          setTopicMap(map)
        } else {
          setModulesList([{id: 'error', name: 'Modules data is not an array'}])
        }
      } catch (err: any) {
        console.error("Modules error:", err)
        setModulesList([{id: 'error', name: 'Error: ' + err.message}])
      }
    }
    loadData()
  }, [])

  const toggleTopic = (topicId: number) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        setTopicDistribution(d => {
          const next = { ...d }
          delete next[topicId]
          return next
        })
        return prev.filter(id => id !== topicId)
      } else {
        return [...prev, topicId]
      }
    })
  }

  const publishExam = async () => {
    setApiError('')
    try {
      const examPayload = {
        examName: title,
        description,
        batchName: selectedBatch,
        examDate,
        examTime,
        duration,
        moduleId: selectedModule,
        topicIds: selectedTopics,
        topicDistribution,
        totalQuestions,
        teacherId: user?.id || user?.userId
      }

      await teacherService.createFullExam(examPayload)

      setSubmitted(true)
      setTimeout(() => {
        navigate('/teacher/dashboard')
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setApiError(err.response?.data?.message || err.message || "Failed to publish exam")
    }
  }

  const steps = [
    { num: 1, label: 'Exam Details' },
    { num: 2, label: 'Module & Topics' },
    { num: 3, label: 'Review & Publish' },
  ]

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-slide-up bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Exam Created Successfully!</h2>
          <p className="text-slate-500 text-base">The system has randomly picked questions and scheduled the exam.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Live Exam</h1>
        <p className="text-slate-500 text-sm mt-0.5">Dynamically generate exams from the question bank.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex items-center">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step > s.num
                    ? 'bg-emerald-500 text-white shadow-md'
                    : step === s.num
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                      : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-xs font-bold mt-2 whitespace-nowrap ${
                  step === s.num ? 'text-blue-700' : step > s.num ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 mb-6 rounded-full transition-colors duration-300 ${
                  step > s.num ? 'bg-emerald-400' : 'bg-slate-100'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Exam Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Core Java Unit Test - 3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Course *</label>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700">
                <option value="" disabled>Select a course</option>
                <option value="PGCP - AC">PGCP - AC</option>
                <option value="PGCP - AI">PGCP - AI</option>
                <option value="PGCP - BDA">PGCP - BDA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Batch *</label>
              <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700">
                <option value="" disabled>Select a batch</option>
                {batchesList.map((b: any) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (Minutes) *</label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes</option>
                <option value={120}>120 Minutes</option>
              </select>
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Date *</label>
              <input type="date" min={new Date().toISOString().split('T')[0]} value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Time *</label>
              <input type="time" value={examTime} onChange={e => setExamTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Select Module & Topics
          </h3>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">1. Select Module *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {modulesList.map(mod => (
                <button
                  key={mod.id}
                  onClick={async () => { 
                    setSelectedModule(mod.id); 
                    setSelectedTopics([]);
                    try {
                      const topicsRes = await teacherService.getTopics(mod.id);
                      const topicsData = topicsRes?.success !== undefined ? topicsRes.data : topicsRes;
                      if (Array.isArray(topicsData)) {
                        setTopicMap((prev: any) => ({
                          ...prev,
                          [mod.id]: topicsData.map((t: any) => ({
                            id: t.topicId || t.id,
                            name: t.topicName || t.name || t.Name,
                            questionCount: t.questionCount || 0
                          }))
                        }));
                      }
                    } catch (err) {
                      console.error("Topics fetch error:", err);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 text-left font-bold transition-colors ${selectedModule === mod.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-200'}`}
                >
                  {mod.name || mod.Name}
                </button>
              ))}
            </div>
          </div>

          {selectedModule && (
            <div className="mt-6 pt-6 border-t border-slate-100 animate-fade-in">
              <label className="block text-sm font-semibold text-slate-700 mb-2">2. Total Number of Questions *</label>
              <input 
                type="number" 
                min={1} 
                value={totalQuestions} 
                onChange={e => setTotalQuestions(Number(e.target.value))} 
                className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          )}

          {selectedModule && totalQuestions > 0 && topicMap[selectedModule] && (
            <div className="mt-6 animate-fade-in pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-slate-700">3. Select Topics & Question Distribution *</label>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800">Total Questions: {totalQuestions}</div>
                  <div className="text-sm text-blue-600 font-semibold">Assigned: {Object.values(topicDistribution).reduce((a, b) => a + (b || 0), 0)}</div>
                  <div className={`text-sm font-bold ${totalQuestions - Object.values(topicDistribution).reduce((a, b) => a + (b || 0), 0) < 0 ? 'text-red-500' : 'text-emerald-600'}`}>Remaining: {totalQuestions - Object.values(topicDistribution).reduce((a, b) => a + (b || 0), 0)}</div>
                </div>
              </div>

              {Object.values(topicDistribution).reduce((a, b) => a + (b || 0), 0) > totalQuestions && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg">
                  Assigned questions exceed the total exam question count. Please reduce the number of questions from one or more topics.
                </div>
              )}

              <div className="space-y-3">
                {topicMap[selectedModule].map((t: any) => (
                  <div key={t.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleTopic(t.id)}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-bold text-left transition-colors flex justify-between items-center ${selectedTopics.includes(t.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-200'}`}
                      >
                        <span>{t.name || t.Name}</span>
                        <span className="text-xs font-medium text-slate-400">Available: {t.questionCount}</span>
                      </button>
                      {selectedTopics.includes(t.id) && (
                        <div className="w-32 animate-fade-in flex flex-col">
                          <input
                            type="number"
                            min={1}
                            max={t.questionCount}
                            placeholder="Qty"
                            value={topicDistribution[t.id] || ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setTopicDistribution(prev => ({ ...prev, [t.id]: val }));
                            }}
                            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${topicDistribution[t.id] > t.questionCount ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'}`}
                          />
                        </div>
                      )}
                    </div>
                    {selectedTopics.includes(t.id) && topicDistribution[t.id] > t.questionCount && (
                      <div className="p-2 mt-1 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg ml-auto w-fit">
                        Only {t.questionCount} active questions are available in the {t.name || t.Name} topic.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Review & Publish
          </h3>
          {apiError && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
              Error: {apiError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-6 mb-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Exam Title</p>
              <p className="font-bold text-slate-900 mt-1">{title || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Module</p>
              <p className="font-bold text-slate-900 mt-1">
                {(modulesList.find(m => m.id === selectedModule)?.name) || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Course</p>
              <div className="mt-2">
                <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 text-sm font-bold rounded-md">{selectedCourse || '—'}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Batch</p>
              <div className="mt-2">
                <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-bold rounded-md">{selectedBatch || '—'}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date & Time</p>
              <p className="font-bold text-slate-900 mt-1">{examDate || '—'} at {examTime || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration & Questions</p>
              <p className="font-bold text-slate-900 mt-1">{duration} Min • {totalQuestions} Questions</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">Pre-Publish Verification</p>
              <p className="text-xs text-amber-700 mt-1">
                The exam will be strictly visible only to students in <b>{selectedBatch}</b> after exactly <b>{examDate} {examTime}</b>.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/teacher/dashboard')}
          className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 shadow-sm transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        {step < 3 ? (
          <button
            onClick={() => {
              if (step === 1) {
                if (!title || !selectedCourse || !selectedBatch || !examDate || !examTime) {
                  alert('Please fill all required fields.')
                  return
                }
                const selectedDateTime = new Date(`${examDate}T${examTime}`);
                if (selectedDateTime <= new Date()) {
                  alert('Exam date and time cannot be in the past.');
                  return;
                }
              }
              if (step === 2) {
                if (!selectedModule || selectedTopics.length === 0 || totalQuestions <= 0) {
                  alert('Please select a module, at least one topic, and valid number of questions.')
                  return
                }
                const assigned = Object.values(topicDistribution).reduce((a, b) => a + (b || 0), 0);
                if (assigned !== totalQuestions) {
                  alert(`The assigned questions (${assigned}) must exactly match the total questions (${totalQuestions}).`);
                  return;
                }
                let exceedsAvailable = false;
                for (const tId of selectedTopics) {
                   const t = topicMap[selectedModule].find((topic: any) => topic.id === tId);
                   if (t && topicDistribution[tId] > t.questionCount) {
                     exceedsAvailable = true;
                     break;
                   }
                }
                if (exceedsAvailable) {
                  alert('One or more topics have assigned questions exceeding their available active questions.');
                  return;
                }
              }
              setStep(step + 1)
            }}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
          >
            Next Step
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={publishExam}
            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Publish Exam
          </button>
        )}
      </div>
    </div>
  )
}
