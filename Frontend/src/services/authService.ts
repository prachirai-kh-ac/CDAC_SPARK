import api from './api'

export interface LoginRequest {
  email: string
  password: string
}

export type LoginResponse = {
  id?: any
  token: string
  refreshToken: string
  userId: string
  fullName: string
  name?: string
  email: string
  role: string
  prn: string | null
  batchId: number | null
  batchName: string | null
  courseName: string | null
  expiresAt: string
  phone?: string
}

export const authService = {
  register: async (data: any) => {
    const res = await api.post('/auth/register', data)
    return res.data
  },

  login: async (data: LoginRequest) => {
    const res = await api.post('/auth/login', data)
    return res.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getMe: async () => {
    const res = await api.get('/auth/profile')
    return res.data
  },

  changePassword: async (data: {
    currentPassword: string
    newPassword: string
  }) => {
    const res = await api.post('/auth/change-password', data)
    return res.data
  },

  saveUser: (user: LoginResponse) => {
    localStorage.setItem('token', user.token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  getStoredUser: (): LoginResponse | null => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('token')
  }
}