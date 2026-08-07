import api from './api'

export const teacherService = {
  createFullExam: async (data: any) => {
    const res = await api.post('/exams', data)
    return res.data
  },
  getBatches: async () => {
    const res = await api.get('/batches')
    return res.data
  },
  getModules: async () => {
    const res = await api.get('/modules')
    return res.data
  },
  getTopics: async (moduleId: number | string) => {
    const res = await api.get(`/modules/${moduleId}/topics`)
    return res.data
  },
  getExam: async (id: number | string) => {
    const res = await api.get(`/exams/${id}`)
    return res.data
  },
  updateExam: async (id: number | string, data: any) => {
    const res = await api.put(`/exams/${id}`, data)
    return res.data
  }
}
