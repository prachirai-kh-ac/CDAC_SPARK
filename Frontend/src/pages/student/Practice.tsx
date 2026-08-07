import { useState, useEffect } from 'react'
import {
  Brain, Clock, BookOpen, List,
  ArrowLeft, AlertTriangle, RefreshCw,
  Database, Coffee, Network, LayoutTemplate, Code2, Server, BrainCircuit, Terminal,
  Info
} from 'lucide-react'
import { mcqService } from '../../services/mcqService'

type Stage = 'modules' | 'topics' | 'instructions' | 'practice' | 'results'

export default function Practice() {
  const [stage, setStage] = useState<Stage>('modules')
  const [loading, setLoading] = useState(false)
  const [modules, setModules] = useState<any[]>([])
  
  const [selectedModule, setSelectedModule] = useState<number | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null)
  const [instructionsRead, setInstructionsRead] = useState(false)
  
  // Practice state
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [questionsAttempted, setQuestionsAttempted] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(40)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [catResults, setCatResults] = useState<any>(null)
  const [practiceError, setPracticeError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const mod = modules.find(m => m.id === selectedModule)

  const fetchTopics = async (moduleId: number) => {
    try {
      const data = await mcqService.getTopics(moduleId);
      const topics = data.map((t: any) => ({
        id: t.topicId,
        name: t.topicName,
        qCount: t.questionCount || 0
      }));
      setModules(prev => prev.map(m => m.id === moduleId ? { ...m, topics } : m));
    } catch (err) {
      console.error('Failed to load topics', err);
    }
  };

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true)
      try {
        const data = await mcqService.getModules()
        const loaded = data.map((m: any) => ({
          id: m.moduleId,
          name: m.moduleName,
          code: m.moduleCode,
          topicsCount: m.topicCount || 0,
          topics: []
        }));
        setModules(loaded)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchModules()
  }, [])

  const getModuleStyle = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('c/c++')) return { icon: Terminal, bg: 'bg-blue-50', text: 'text-blue-600', border: 'hover:border-blue-400' }
    if (n.includes('dbt') || n.includes('sql')) return { icon: Database, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'hover:border-emerald-400' }
    if (n.includes('core java')) return { icon: Coffee, bg: 'bg-orange-50', text: 'text-orange-600', border: 'hover:border-orange-400' }
    if (n.includes('dsa')) return { icon: Network, bg: 'bg-purple-50', text: 'text-purple-600', border: 'hover:border-purple-400' }
    if (n.includes('mern')) return { icon: LayoutTemplate, bg: 'bg-teal-50', text: 'text-teal-600', border: 'hover:border-teal-400' }
    if (n.includes('advanced java')) return { icon: Coffee, bg: 'bg-red-50', text: 'text-red-600', border: 'hover:border-red-400' }
    if (n.includes('.net')) return { icon: Code2, bg: 'bg-sky-50', text: 'text-sky-600', border: 'hover:border-sky-400' }
    if (n.includes('cossdm')) return { icon: Server, bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'hover:border-indigo-400' }
    if (n.includes('aptitude')) return { icon: BrainCircuit, bg: 'bg-pink-50', text: 'text-pink-600', border: 'hover:border-pink-400' }
    return { icon: Brain, bg: 'bg-slate-50', text: 'text-slate-600', border: 'hover:border-slate-400' }
  }

  useEffect(() => {
    let timer: any
    if (stage === 'practice' && timeLeft > 0 && !submitting) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [stage, timeLeft, submitting])

  const startTest = async () => {
    setLoading(true)
    setPracticeError(null)
    try {
      const res = await mcqService.startAdaptiveExam(selectedTopic.id)
      setAttemptId(res.attemptId)
      setTotalQuestions(res.totalQuestions || 40)
      setQuestionsAttempted(0)
      
      const qRes = await mcqService.getNextAdaptiveQuestion(selectedTopic.id, res.attemptId)
      setCurrentQuestion(qRes)
      setSelectedOption(null)
      setTimeLeft(30 * 60)
      setQuestionStartTime(Date.now())
      setStage('practice')
    } catch (err: any) {
      setPracticeError(err.response?.data?.message || 'Failed to start adaptive exam.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (idx: number) => {
    setSelectedOption(idx)
  }

  const saveAndNext = async (isSkip: boolean = false) => {
    if (!currentQuestion || submitting) return;
    setSubmitting(true);
    
    try {
      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
      let answerStr = 'SKIP';
      if (!isSkip && selectedOption !== null) {
        answerStr = selectedOption === 0 ? 'A' : selectedOption === 1 ? 'B' : selectedOption === 2 ? 'C' : 'D';
      }

      await mcqService.submitAdaptiveAnswer(selectedTopic.id, {
        attemptId: attemptId!,
        questionId: currentQuestion.questionId,
        selectedAnswer: answerStr,
        timeTaken
      });

      const nextCount = questionsAttempted + 1;
      setQuestionsAttempted(nextCount);

      if (nextCount >= totalQuestions) {
        await submitTest(true); 
      } else {
        const qRes = await mcqService.getNextAdaptiveQuestion(selectedTopic.id, attemptId!);
        setCurrentQuestion(qRes);
        setSelectedOption(null);
        setQuestionStartTime(Date.now());
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      setPracticeError('Network error while saving answer');
      setSubmitting(false);
    }
  }

  const submitTest = async (alreadySubmitting: boolean = false) => {
    if (!alreadySubmitting) setSubmitting(true);
    try {
      const res = await mcqService.finishAdaptiveExam(selectedTopic.id, { attemptId: attemptId! });
      setCatResults(res);
      setStage('results');
    } catch (err) {
      console.error(err);
      setPracticeError('Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading && stage !== 'practice') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-blue-600 font-semibold animate-fade-in">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span>Loading Content...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-12">
      {/* Dynamic Header */}
      {stage !== 'practice' && stage !== 'results' && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Adaptive Practice MCQ</h1>
          <p className="text-slate-500 mt-2">Master your concepts.</p>
        </div>
      )}

      {/* ── STAGE 1: Modules ── */}
      {stage === 'modules' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(m => {
              const style = getModuleStyle(m.name)
              const Icon = style.icon
              return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModule(m.id)
                  setStage('topics')
                  fetchTopics(m.id)
                }}
                className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 ${style.border} hover:shadow-md hover:-translate-y-1 transition-all text-left flex flex-col items-start gap-4`}
              >
                <div className={`w-14 h-14 ${style.bg} ${style.text} rounded-2xl flex items-center justify-center shadow-sm`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{m.name}</h3>
                  <p className="text-slate-500 text-sm mt-1 font-medium">{m.topicsCount || 0} Topics Available</p>
                </div>
              </button>
            )})}
          </div>
        </div>
      )}

      {/* ── STAGE 2: Topics ── */}
      {stage === 'topics' && (
        <div className="animate-fade-in">
          <button onClick={() => setStage('modules')} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Modules
          </button>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">{mod?.name} — Topics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mod?.topics?.map((topic: any) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopic(topic)
                    setInstructionsRead(false)
                    setStage('instructions')
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-left transition-all group"
                >
                  <List className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                  <span className="font-medium text-slate-700">{topic.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 3: Instructions ── */}
      {stage === 'instructions' && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          <button onClick={() => setStage('topics')} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Topics
          </button>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
            {practiceError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{practiceError}</p>
              </div>
            )}

            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                 <BookOpen className="w-8 h-8" />
               </div>
               <div>
                 <h1 className="text-2xl font-bold text-slate-900 mb-1">{mod?.name}</h1>
                 <p className="text-lg text-slate-500 font-medium">{selectedTopic?.name} — Adaptive Test</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-semibold mb-1 uppercase tracking-wider">Questions</p>
                  <p className="text-3xl font-bold text-slate-800">40</p>
                </div>
                <List className="w-8 h-8 text-slate-300" />
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-semibold mb-1 uppercase tracking-wider">Duration</p>
                  <p className="text-3xl font-bold text-slate-800">30 <span className="text-lg font-medium text-slate-500">Min</span></p>
                </div>
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" /> Instructions
            </h3>
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 mb-8">
              <ul className="space-y-3 text-slate-700 font-medium list-disc pl-5">
                <li>This is an <strong>Adaptive Test</strong>. Question difficulty will change based on your performance.</li>
                <li>Each question has 4 options. Only one option is correct.</li>
                <li>There is <strong>no negative marking</strong>.</li>
                <li>Once an answer is submitted and you move forward, <strong className="text-red-600">it cannot be changed</strong>.</li>
                <li>Complete the test within the allotted time (30 Minutes).</li>
              </ul>
            </div>

            <label className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors mb-8 group">
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                checked={instructionsRead}
                onChange={(e) => setInstructionsRead(e.target.checked)}
              />
              <span className="text-slate-700 font-semibold group-hover:text-slate-900">I have read and understood the instructions. I am ready to begin.</span>
            </label>

            <button
              onClick={startTest}
              disabled={!instructionsRead || loading}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="w-5 h-5 animate-spin" />}
              {loading ? 'Preparing CAT Engine...' : 'Start Adaptive Test'}
            </button>
          </div>
        </div>
      )}

      {/* ── STAGE 4: Practice (Live Exam) ── */}
      {stage === 'practice' && currentQuestion && (
        <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-y-auto animate-fade-in">
          {/* Top Exam Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold font-serif text-xl shadow-sm">
                S
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">{mod?.name}</h1>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{selectedTopic?.name} — Adaptive Test</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold shadow-inner ${
              timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 flex flex-col">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col relative">
              
              {submitting && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                   <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
              )}

              <div className="mb-8 border-b border-slate-100 pb-6">
                 <div className="flex justify-between items-center mb-3">
                   <h2 className="text-lg font-bold text-slate-800">Question {questionsAttempted + 1} of {totalQuestions}</h2>
                   <span className="text-sm font-bold text-blue-600">{Math.round((questionsAttempted / totalQuestions) * 100)}% Completed</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                   <div 
                     className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                     style={{ width: `${((questionsAttempted + 1) / totalQuestions) * 100}%` }}
                   ></div>
                 </div>
              </div>
              
              <p className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed mb-10">
                {currentQuestion.questionText}
              </p>

              <div className="space-y-4 mb-auto">
                {[currentQuestion.optionA, currentQuestion.optionB, currentQuestion.optionC, currentQuestion.optionD].map((opt: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                      selectedOption === idx
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20 shadow-sm'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedOption === idx ? 'border-blue-600' : 'border-slate-300'
                    }`}>
                      {selectedOption === idx && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                    </div>
                    <span className={`text-lg ${selectedOption === idx ? 'text-blue-900 font-bold' : 'text-slate-700 font-medium'}`}>
                      {opt}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => saveAndNext(true)}
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  Skip Question
                </button>
                <button
                  onClick={() => saveAndNext(false)}
                  disabled={selectedOption === null || submitting}
                  className="px-10 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg active:transform active:scale-95 flex items-center gap-2"
                >
                  {questionsAttempted === totalQuestions - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 5: Results ── */}
      {stage === 'results' && catResults && (
        <div className="animate-fade-in max-w-4xl mx-auto">
          <button onClick={() => setStage('modules')} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Modules
          </button>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Performance Report</h2>
            <p className="text-slate-500 mb-8">{mod?.name} — {selectedTopic?.name}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-purple-600 text-sm font-bold uppercase tracking-wider mb-2">Ability Score</p>
                <p className="text-3xl lg:text-4xl font-black text-purple-700">{catResults.abilityScore}</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-blue-600 text-sm font-bold uppercase tracking-wider mb-2">Weighted Score</p>
                <p className="text-3xl lg:text-4xl font-black text-blue-700">{catResults.weightedScore}</p>
              </div>
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-2">Accuracy</p>
                <p className="text-3xl lg:text-4xl font-black text-emerald-700">{catResults.accuracy}%</p>
              </div>
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-amber-600 text-sm font-bold uppercase tracking-wider mb-2">Percentage</p>
                <p className="text-3xl lg:text-4xl font-black text-amber-700">{catResults.percentage}%</p>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-left">
               <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">Difficulty Performance breakdown</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                   <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-xl">{catResults.easyCorrect || 0}</div>
                   <div>
                     <p className="text-sm font-bold text-slate-500 uppercase">Easy Correct</p>
                     <p className="text-xs text-slate-400 mt-0.5">1 Mark each</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">{catResults.mediumCorrect || 0}</div>
                   <div>
                     <p className="text-sm font-bold text-slate-500 uppercase">Medium Correct</p>
                     <p className="text-xs text-slate-400 mt-0.5">2 Marks each</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                   <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-xl">{catResults.hardCorrect || 0}</div>
                   <div>
                     <p className="text-sm font-bold text-slate-500 uppercase">Hard Correct</p>
                     <p className="text-xs text-slate-400 mt-0.5">3 Marks each</p>
                   </div>
                 </div>
               </div>
            </div>
            
            <div className="mt-8 text-slate-500 font-medium">
               Time Taken: {formatTime(catResults.timeTakenSeconds || 0)}
            </div>

            {/* Detailed Question Review */}
            {catResults.responses && catResults.responses.length > 0 && (
              <div className="mt-12 text-left bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-6 border-b border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800">Detailed Question Review</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {catResults.responses.map((res: any, idx: number) => (
                    <div key={idx} className="p-6">
                      <div className="flex gap-4 items-start mb-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${res.isCorrect ? 'bg-emerald-500' : res.selectedAnswer === 'SKIP' ? 'bg-slate-400' : 'bg-red-500'}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${res.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-700' : res.difficulty === 'HARD' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{res.difficulty}</span>
                            {res.isCorrect ? (
                              <span className="text-sm font-bold text-emerald-600">Correct (+{res.difficulty === 'HARD' ? 3 : res.difficulty === 'MEDIUM' ? 2 : 1})</span>
                            ) : res.selectedAnswer === 'SKIP' ? (
                              <span className="text-sm font-bold text-slate-500">Skipped (0)</span>
                            ) : (
                              <span className="text-sm font-bold text-red-500">Incorrect (0)</span>
                            )}
                          </div>
                          <p className="text-slate-800 font-medium">{res.questionText}</p>
                        </div>
                      </div>
                      
                      <div className="ml-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['A', 'B', 'C', 'D'].map(optKey => {
                          const optText = res[`option${optKey}`];
                          if (!optText) return null;
                          const isSelected = res.selectedAnswer === optKey;
                          const isCorrectOpt = res.correctAnswer === optKey;
                          
                          let optStyle = "bg-slate-50 border-slate-200 text-slate-600";
                          if (isCorrectOpt) {
                            optStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium ring-1 ring-emerald-500";
                          } else if (isSelected && !isCorrectOpt) {
                            optStyle = "bg-red-50 border-red-300 text-red-800 font-medium ring-1 ring-red-500";
                          }

                          return (
                            <div key={optKey} className={`p-3 rounded-xl border ${optStyle} flex items-center gap-3`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrectOpt ? 'bg-emerald-200 text-emerald-800' : isSelected ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-500'}`}>
                                {optKey}
                              </div>
                              <span className="text-sm">{optText}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 ml-12 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-sm font-bold text-blue-800 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-700">{res.explanation && res.explanation.trim() !== '' ? res.explanation : 'No explanation provided in the question bank for this question.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
