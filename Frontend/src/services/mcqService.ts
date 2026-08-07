import api from './api'

export const mcqService = {
  // Modules (Subjects)
  getModules: async () => {
    const res = await api.get('/modules')
    return res.data
  },
  addModule: async (data: { name: string; description?: string }) => {
    const res = await api.post('/modules', data)
    return res.data
  },
  updateModule: async (id: number, data: { name: string; description?: string }) => {
    const res = await api.put(`/modules/${id}`, data)
    return res.data
  },
  deleteModule: async (id: number) => {
    const res = await api.delete(`/modules/${id}`)
    return res.data
  },

  // Topics
  getTopics: async (moduleId?: number) => {
    const res = await api.get(`/modules/${moduleId}/topics`)
    return res.data
  },
  addTopic: async (data: { name: string; moduleId: number }) => {
    const res = await api.post('/topics', data)
    return res.data
  },
  updateTopic: async (id: number, data: { name: string; moduleId: number }) => {
    const res = await api.put(`/topics/${id}`, data)
    return res.data
  },
  deleteTopic: async (id: number) => {
    const res = await api.delete(`/topics/${id}`)
    return res.data
  },

  // Subtopics
  // Subtopics
  getSubTopics: async (topicId?: number) => {
    // const res = await api.get('/subtopics', { params: { topicId } })
    return [] // Backend does not support subtopics currently
  },
  addSubTopic: async (data: { name: string; topicId: number }) => {
    // const res = await api.post('/subtopics', data)
    return {}
  },
  updateSubTopic: async (id: number, data: { name: string; topicId: number }) => {
    // const res = await api.put(`/subtopics/${id}`, data)
    return {}
  },
  deleteSubTopic: async (id: number) => {
    // const res = await api.delete(`/subtopics/${id}`)
    return {}
  },

  // Questions
  getQuestions: async (params: {
    moduleId?: number
    topicId?: number
    difficulty?: string
    status?: string
    search?: string
    page: number
    pageSize: number
  }) => {
    const res = await api.post('/questions/search', params)
    return res.data
  },
  addQuestion: async (data: {
    questionText: string
    optionA: string
    optionB: string
    optionC: string
    optionD: string
    correctOption: number
    explanation?: string
    difficulty: string
    marks: number
    topicId: number
    subTopicId?: number | null
  }) => {
    const res = await api.post('/questions', data)
    return res.data
  },
  updateQuestion: async (
    id: number,
    data: {
      questionText: string
      optionA: string
      optionB: string
      optionC: string
      optionD: string
      correctOption: number
      explanation?: string
      difficulty: string
      marks: number
      topicId: number
      subTopicId?: number | null
      status: string
    }
  ) => {
    const res = await api.put(`/questions/${id}`, data)
    return res.data
  },
  deleteQuestion: async (id: number) => {
    const res = await api.delete(`/questions/${id}`)
    return res.data
  },
  getStats: async () => {
    // const res = await api.get('/questions/stats')
    return {
      totalQuestions: 0,
      byModule: [],
      byDifficulty: []
    }
  },

  // Difficulty Configs
  // Difficulty Configs (TopicBlueprint)
  getDifficultyConfigs: async (topicId: number) => {
    // Backend doesn't support fetching blueprint by topic currently
    return []
  },
  updateDifficultyConfigs: async (topicId: number, data: any[]) => {
    return {}
  },

  // Adaptive CAT Exams
  startAdaptiveExam: async (examId: number, examType: string = 'PRACTICE') => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const res = await api.post(`/exams/${examId}/adaptive/start`, { 
      studentId: user?.userId || user?.id || 1,
      examType: examType 
    })
    return res.data
  },
  getNextAdaptiveQuestion: async (examId: number, attemptId: number) => {
    const res = await api.get(`/exams/${examId}/adaptive/next-question?attemptId=${attemptId}`)
    return res.data
  },
  submitAdaptiveAnswer: async (examId: number, data: { attemptId: number, questionId: number, selectedAnswer: string, timeTaken: number }) => {
    const res = await api.post(`/exams/${examId}/adaptive/answer`, data)
    return res.data
  },
  finishAdaptiveExam: async (examId: number, data: { attemptId: number }) => {
    const res = await api.post(`/exams/${examId}/adaptive/finish`, data)
    return res.data
  }
}
