import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Loader2, CheckCircle2, ArrowLeft, KeyRound, Lock, Eye, EyeOff } from 'lucide-react'
import api from '../../services/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  
  const [username, setUsername] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Please enter your PRN or Email')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { username: username.trim() })
      setSuccessMsg(res.data.message || 'If the account exists, an OTP has been sent.')
      setStep(2)
    } catch (err: any) {
      // Even on error, we might just show the generic message if the backend returned an error (though our backend returns 200)
      setSuccessMsg('If the account exists, an OTP has been sent.')
      setStep(2)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 4 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 4-digit OTP')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { username: username.trim(), otp })
      if (res.data.success) {
        setStep(3)
        setError('')
      } else {
        setError(res.data.message || 'Invalid OTP')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    if (!/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])/.test(newPassword)) {
      setError('Password must contain uppercase, lowercase, and a number')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setIsLoading(true)
    try {
      const res = await api.post('/auth/reset-password', { 
        username: username.trim(), 
        otp, 
        newPassword 
      })
      if (res.data.success) {
        alert(res.data.message || 'Password changed successfully. Please login with your new password.')
        navigate('/login')
      } else {
        setError(res.data.message || 'Failed to reset password')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-lg">CDAC SPARK</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-8 relative overflow-hidden">
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
            <div 
              className="h-full bg-primary-500 transition-all duration-500 ease-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {step === 1 && (
            <div className="animate-slide-up">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Forgot Password?</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Enter your registered PRN or Email to receive an OTP.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Username / PRN
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your PRN or Email"
                    className={`input-field ${error ? 'border-red-300 ring-red-100' : ''}`}
                    required
                  />
                  {error && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up">
              <div className="mb-6 text-center">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Verify OTP</h2>
                <p className="text-slate-500 text-sm mt-1">
                  {successMsg}
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 text-center">
                    Enter 4-digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • •"
                    className={`input-field text-center text-2xl tracking-widest font-mono py-3 ${error ? 'border-red-300 ring-red-100' : ''}`}
                    required
                  />
                  {error && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium text-center">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 4}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  className="w-full text-sm text-primary-600 font-medium hover:text-primary-700 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up">
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Create a new secure password for your account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <ul className="text-[10px] text-slate-500 mt-2 space-y-1 ml-1 list-disc list-inside">
                    <li className={newPassword.length >= 8 ? "text-green-600" : ""}>At least 8 characters</li>
                    <li className={/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? "text-green-600" : ""}>Uppercase & lowercase letters</li>
                    <li className={/[0-9]/.test(newPassword) ? "text-green-600" : ""}>At least one number</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                  {error && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
