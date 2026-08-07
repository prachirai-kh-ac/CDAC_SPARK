import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/authService'

interface LoginResponse {
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

interface AuthContextType {
  user: LoginResponse | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  error: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<LoginResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState('')

useEffect(() => {
  const stored = authService.getStoredUser()
  if (stored) {
    // Token expiry check
    const expiresAt = new Date(stored.expiresAt)
    const now = new Date()
    if (expiresAt > now) {
      setUser(stored)
    } else {
      // Token expired — logout
      authService.logout()
    }
  }
}, [])
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await authService.login({ email, password })
      
      // Save to local storage
      authService.saveUser(response)
      setUser(response)
      setIsLoading(false)
      return true
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
         setError('Invalid username or password')
      } else {
         setError('Login failed: ' + (err.response?.data?.message || err.message))
      }
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
