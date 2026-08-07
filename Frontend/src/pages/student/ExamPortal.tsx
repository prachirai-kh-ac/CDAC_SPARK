import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Clock, AlertTriangle, Send, Loader2, RefreshCw, CheckCircle2, Shield
} from 'lucide-react'
import { mcqService } from '../../services/mcqService'
import { examService } from '../../services/examService'

export default function ExamPortal() {
  const navigate = useNavigate()
  const location = useLocation()
  const exam = location.state?.exam

  const [loading, setLoading] = useState(true)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [questionsAttempted, setQuestionsAttempted] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(20)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  
  const [timeLeft, setTimeLeft] = useState(1800) // Default 30 min
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [submitting, setSubmitting] = useState(false)

  const [violations, setViolations] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMsg, setWarningMsg] = useState('')
  const [examSubmitted, setExamSubmitted] = useState(false)

  // Media state
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [permissionRequested, setPermissionRequested] = useState(false)
  const [permissionError, setPermissionError] = useState('')
  const [camStatus, setCamStatus] = useState(false)
  const [micStatus, setMicStatus] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const requestMediaPermissions = useCallback(async () => {
    setPermissionRequested(true)
    setPermissionError('')
    
    // Check if API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError('Your browser does not support media devices. Please use a modern browser or ensure you are using HTTPS.')
      setPermissionsGranted(false)
      return
    }

    try {
      console.log('Requesting getUserMedia...')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      console.log('Media permissions granted!')
      
      streamRef.current = mediaStream
      setPermissionsGranted(true)
      
      const hasVideo = mediaStream.getVideoTracks().length > 0;
      const hasAudio = mediaStream.getAudioTracks().length > 0;
      setCamStatus(hasVideo);
      setMicStatus(hasAudio);
      
    } catch (err: any) {
      console.error('Media permission error:', err)
      let errorMessage = 'Camera and Microphone permissions are required to attend the live exam.'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permission denied. Camera and Microphone permissions are required to attend the live exam.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found on this device.'
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Your camera or microphone is already in use by another application.'
      }
      
      setPermissionError(errorMessage)
      setPermissionsGranted(false)
    }
  }, [])

  const stopMediaStreams = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setCamStatus(false)
      setMicStatus(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      stopMediaStreams()
    }
  }, [stopMediaStreams])

  useEffect(() => {
    if (videoRef.current && streamRef.current && permissionsGranted && !loading) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [permissionsGranted, loading])

  // Start exam attempt on mount
  useEffect(() => {
    if (!permissionsGranted) return;

    const startAttempt = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        }
      } catch (err) {
        console.log("Fullscreen request failed", err)
      }

      const eId = exam?.examId || exam?.id
      if (!eId) {
        alert('Invalid exam configuration.')
        navigate('/student/dashboard')
        return
      }

      try {
        const res = await mcqService.startAdaptiveExam(Number(eId), 'LIVE')
        setAttemptId(res.attemptId)
        setTotalQuestions(res.totalQuestions || exam.questions || 20)
        setQuestionsAttempted(0)
        
        // Fetch first question
        const qRes = await mcqService.getNextAdaptiveQuestion(Number(eId), res.attemptId)
        setCurrentQuestion(qRes)
        setSelectedOption(null)
        
        const duration = exam.durationMinutes || exam.duration || 30
        setTimeLeft(duration * 60)
        setQuestionStartTime(Date.now())
      } catch (err: any) {
        console.error(err)
        alert(err.response?.data?.message || 'Error starting exam')
        navigate('/student/dashboard')
      } finally {
        setLoading(false)
      }
    }

    startAttempt()
  }, [permissionsGranted, exam, navigate])

  // Timer
  useEffect(() => {
    if (examSubmitted || loading || submitting) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit('AutoSubmit')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [examSubmitted, loading, submitting])

  const lastViolationTime = useRef<number>(0)

  // Violation detection
  const triggerViolation = useCallback(async (msg: string, type: string) => {
    if (!attemptId || examSubmitted || violations >= 3) return
    
    const now = Date.now()
    if (now - lastViolationTime.current < 3000) return // Throttling duplicate events (3 seconds)
    lastViolationTime.current = now

    try {
      await examService.recordViolation({
        attemptId,
        type,
        details: msg
      })
    } catch (err) {
      console.error('Failed to log violation:', err)
    }

    setViolations(prev => {
      const newCount = prev + 1
      setWarningMsg(type)
      setShowWarning(true)
      if (newCount >= 3) {
        setTimeout(() => handleSubmit('AutoSubmit'), 2500)
      }
      return newCount
    })
  }, [attemptId, examSubmitted, violations])

  useEffect(() => {
    if (loading || !attemptId || examSubmitted) return

    const handleVisibility = () => {
      if (document.hidden) triggerViolation('You have switched away from the exam window.', 'TAB_SWITCH')
    }
    const handleBlur = () => {
      // Small timeout to check if it's an actual blur or just an alert/modal popping up
      setTimeout(() => {
        if (!document.hasFocus()) {
          triggerViolation('You have switched away from the exam window.', 'TAB_SWITCH')
        }
      }, 200)
    }
    
    const preventCopy = (e: Event) => {
      e.preventDefault()
      triggerViolation('Copy action is disabled during the exam.', 'COPY')
    }
    const preventCut = (e: Event) => {
      e.preventDefault()
      triggerViolation('Cut action is disabled during the exam.', 'CUT')
    }
    const preventPaste = (e: Event) => {
      e.preventDefault()
      triggerViolation('Paste action is disabled during the exam.', 'PASTE')
    }
    const preventContextMenu = (e: Event) => {
      e.preventDefault()
      triggerViolation('Right-click context menu is disabled.', 'RIGHT_CLICK')
    }
    const preventSelect = (e: Event) => {
      e.preventDefault()
      triggerViolation('Text selection is disabled.', 'TEXT_SELECTION')
    }
    
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
    
    // Anti-cheat events
    document.addEventListener('copy', preventCopy)
    document.addEventListener('cut', preventCut)
    document.addEventListener('paste', preventPaste)
    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('selectstart', preventSelect)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('copy', preventCopy)
      document.removeEventListener('cut', preventCut)
      document.removeEventListener('paste', preventPaste)
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('selectstart', preventSelect)
    }
  }, [loading, attemptId, examSubmitted, triggerViolation])

  const handleAnswer = (idx: number) => {
    setSelectedOption(idx)
  }

  const saveAndNext = async (isSkip: boolean = false) => {
    if (!currentQuestion || submitting || !attemptId || examSubmitted) return;
    setSubmitting(true);
    const eId = exam?.examId || exam?.id;
    
    try {
      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
      let answerStr = 'SKIP';
      if (!isSkip && selectedOption !== null) {
        answerStr = selectedOption === 0 ? 'A' : selectedOption === 1 ? 'B' : selectedOption === 2 ? 'C' : 'D';
      }

      await mcqService.submitAdaptiveAnswer(Number(eId), {
        attemptId,
        questionId: currentQuestion.questionId,
        selectedAnswer: answerStr,
        timeTaken
      });

      const nextCount = questionsAttempted + 1;
      setQuestionsAttempted(nextCount);

      if (nextCount >= totalQuestions) {
        await handleSubmit('UserSubmit');
      } else {
        const qRes = await mcqService.getNextAdaptiveQuestion(Number(eId), attemptId);
        setCurrentQuestion(qRes);
        setSelectedOption(null);
        setQuestionStartTime(Date.now());
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      alert('Network error while saving answer');
      setSubmitting(false);
    }
  }

  const handleSubmit = async (reason = 'UserSubmit') => {
    if (!attemptId || examSubmitted) return
    setSubmitting(true)
    const eId = exam?.examId || exam?.id;
    try {
      await mcqService.finishAdaptiveExam(Number(eId), { attemptId })
      setExamSubmitted(true)
      setSubmitting(false)
      stopMediaStreams()
      
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen()
        }
      } catch (err) {
        console.log("Exit fullscreen failed", err)
      }
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.message || 'Error submitting exam')
      navigate('/student/dashboard')
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (!permissionsGranted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
          {permissionError ? (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Permissions Required</h2>
              <p className="text-slate-500 mb-8">{permissionError}</p>
              <button 
                onClick={requestMediaPermissions}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all"
              >
                Retry Permission
              </button>
            </>
          ) : !permissionRequested ? (
            <>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">System Check</h2>
              <p className="text-slate-500 mb-8">We need access to your camera and microphone to ensure exam integrity. Please grant the permissions in the next step.</p>
              <button 
                onClick={requestMediaPermissions}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all"
              >
                Start Live Exam
              </button>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-6" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Requesting Permissions</h2>
              <p className="text-slate-500">Please allow camera and microphone access when prompted by your browser.</p>
            </>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Preparing CAT Environment...</p>
        </div>
      </div>
    )
  }

  if (examSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Exam Submitted</h2>
          <p className="text-slate-500 mb-8">
            Your responses have been recorded successfully. Results will be available in your dashboard once published by the instructor.
          </p>
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const timerDanger = timeLeft < 300 // last 5 mins

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-slate-800 text-base font-bold tracking-tight">
              {exam?.title || 'Live Adaptive Examination'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Violations */}
          {violations > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 text-sm font-semibold">
                Violations {violations} / 3
              </span>
            </div>
          )}

          {/* Timer */}
          <div className={`flex items-center gap-2 px-5 py-2 rounded-xl border-2 font-mono text-lg font-bold shadow-sm transition-colors ${
            timerDanger
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <Clock className={`w-5 h-5 ${timerDanger ? 'animate-pulse text-red-500' : 'text-slate-400'}`} />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex flex-col-reverse xl:flex-row items-start justify-center p-6 md:p-8 gap-6 overflow-y-auto w-full max-w-7xl mx-auto select-none">
         
          <div className="flex-1 w-full max-w-4xl bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 flex flex-col relative min-h-[500px]">
              
            {submitting && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-3xl">
                  <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-slate-600 font-bold">Processing adaptive engine...</p>
              </div>
            )}

            {currentQuestion && (
              <>
                <div className="mb-8 border-b border-slate-100 pb-6">
                   <div className="flex justify-between items-center mb-3">
                     <h2 className="text-xl font-bold text-slate-800">Question {questionsAttempted + 1} of {totalQuestions}</h2>
                     <span className="text-sm font-bold text-blue-600">{Math.round((questionsAttempted / totalQuestions) * 100)}% Completed</span>
                   </div>
                   <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                     <div 
                       className="h-full bg-blue-600 transition-all duration-500 ease-out relative" 
                       style={{ width: `${Math.max(5, (questionsAttempted / totalQuestions) * 100)}%` }}
                     >
                       <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                     </div>
                   </div>
                </div>
                
                <p className="text-base text-slate-800 font-semibold leading-relaxed mb-6">
                  {currentQuestion.questionText}
                </p>

                <div className="space-y-3 mb-auto">
                  {[currentQuestion.optionA, currentQuestion.optionB, currentQuestion.optionC, currentQuestion.optionD].map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border-2 text-left transition-all duration-150 group ${
                        selectedOption === idx
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20 shadow-sm'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedOption === idx ? 'border-blue-600 bg-white' : 'border-slate-300 group-hover:border-blue-400'
                      }`}>
                        {selectedOption === idx ? <div className="w-3 h-3 bg-blue-600 rounded-full" /> : <span className="text-xs font-bold text-slate-400 group-hover:text-blue-500">{String.fromCharCode(65 + idx)}</span>}
                      </div>
                      <span className={`text-sm ${selectedOption === idx ? 'text-blue-950 font-bold' : 'text-slate-700 font-medium group-hover:text-slate-900'}`}>
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => saveAndNext(true)}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    Skip Question
                  </button>
                  <button
                    onClick={() => saveAndNext(false)}
                    disabled={selectedOption === null || submitting}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all shadow hover:shadow-md active:scale-98 flex items-center gap-2"
                  >
                    {questionsAttempted === totalQuestions - 1 ? (
                       <><Send className="w-4 h-4" /> Submit Exam</>
                    ) : 'Submit & Next'} 
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Camera Preview */}
          <div className="w-full xl:w-[280px] shrink-0 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <span className="text-slate-800 font-bold text-sm">📷 Live Camera</span>
            </div>
            <div className="relative w-full aspect-video bg-slate-900">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
            </div>
            <div className="p-4 bg-white text-sm font-semibold space-y-2 border-t border-slate-100 text-slate-700">
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${camStatus ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  Camera {camStatus ? 'Connected' : 'Not Available'}
               </div>
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${micStatus ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  Microphone {micStatus ? 'Connected' : 'Not Available'}
               </div>
            </div>
          </div>
      </div>

      {/* Violation Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 max-w-sm w-full mx-4 text-center">
            
            {violations >= 3 ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Exam Terminated</h2>
                <p className="text-slate-600 text-base font-medium mb-2">Maximum violations reached.</p>
                <p className="text-slate-600 text-base font-medium mb-6">Your exam is being submitted automatically.</p>
                <div className="py-3 px-4 bg-red-50 text-red-700 rounded-xl font-bold border border-red-200">
                  Submitting Exam...
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Exam Warning</h2>
                <p className="text-slate-600 text-base font-medium mb-4">Suspicious activity detected.</p>
                
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 text-left space-y-3">
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Reason:</span>
                    <span className="text-sm font-semibold text-slate-800">{warningMsg === 'TAB_SWITCH' ? 'Tab Switching' : warningMsg}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Violation:</span>
                    <span className="text-sm font-semibold text-red-600">{violations} / 3</span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-1">Please continue your exam carefully.</p>
                <p className="text-slate-600 text-sm mb-6">After 3 violations your exam will be submitted automatically.</p>
                
                <button
                  onClick={() => setShowWarning(false)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors"
                >
                  Continue Exam
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
