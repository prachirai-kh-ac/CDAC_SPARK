import api from './api'

export const examService = {
  getUpcoming: async () => {
    const res = await api.get('/exams')
    return res.data
  },

  startExam: async (examId: number) => {
    const res = await api.post(`/exams/${examId}/start`, { studentId: 1 })
    return res.data
  },

  saveAnswer: async (data: {
    attemptId: number
    questionId: number
    selectedOption: number | null
    isFlagged: boolean
  }) => {
    const res = await api.post('/attempt-response', data)
    return res.data
  },

  submitExam: async (data: {
    examId: number
    attemptId: number
    reason: string
  }) => {
    const res = await api.post(`/exams/${data.examId}/submit`, { attemptId: data.attemptId, submissionReason: data.reason })
    return res.data
  },

  getResult: async (attemptId: number) => {
    const res = await api.get(`/result/${attemptId}`)
    return res.data
  },

  recordViolation: async (data: {
    attemptId: number
    type: string
    details?: string
  }) => {
    const res = await api.post('/exams/violation', data)
    return res.data
  },
}