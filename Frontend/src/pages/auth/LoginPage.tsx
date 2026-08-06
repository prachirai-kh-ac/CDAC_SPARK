import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { authService } from '../../services/authService'

// Decorative SVG wave lines — signature element matching Esom Care aesthetic
function WaveLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
      viewBox="0 0 500 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[0, 30, 60, 90, 120, 150].map((offset, i) => (
        <path
          key={i}
          d={`M${320 + offset} -20 C${300 + offset} 100, ${450 + offset} 200, ${380 + offset} 320 S${250 + offset} 480, ${340 + offset} 620`}
          stroke="#94a3b8"
          strokeWidth="1.2"
          fill="none"
        />
      ))}
    </svg>
  )
}

// Logo mark
function LogoMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 36 : 48
  return (
    <div
      style={{ width: s, height: s }}
      className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg border border-blue-400 flex items-center justify-center"
    >
      <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white"></polygon>
      </svg>
    </div>
  )
}

export default function LoginPage() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error }     = useAuth()
  const navigate                        = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const success = await login(email, password)
      if (success) {
        const stored = authService.getStoredUser()
        if (!stored) return
        navigate(`/${stored.role.toLowerCase()}/dashboard`)
      }
    } catch {
      // the error is handled in useAuth
    }
  }

  return (
    <div className="w-full" style={{ background: '#e8eef4' }}>
      {/* ── Hero Section (Login) ── */}
      <div className="min-h-screen flex">
        {/* ── Left hero panel ── */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: '#e8eef4' }}>
          <WaveLines />
  
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoMark />
              <span className="text-xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>CDAC Spark</span>
            </div>
            {/* Links moved to the right panel for alignment */}
          </div>

        <div className="relative z-10 space-y-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-sky-600">
            Welcome to CDAC Spark
          </p>
          <h1 className="text-5xl font-bold leading-tight text-slate-800" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
            The Smartest Way<br />
            <span className="text-slate-900">Exams Get Aced!</span>
          </h1>
          <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
            A unified platform for preparation, proctored assessments, and performance tracking — built for CDAC students and faculty.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { value: '214+', label: 'Students' },
            { value: '12',   label: 'Courses'  },
            { value: '100%', label: 'Digital'  },
          ].map(s => (
            <div key={s.label} className="bg-white/60 backdrop-blur rounded-xl p-4 border border-white/80">
              <div className="text-xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden" style={{ background: '#e8eef4' }}>
        <WaveLines />

        {/* Top Links aligned with form's right edge */}
        <div className="hidden lg:flex absolute top-12 left-0 w-full h-12 items-center justify-center pointer-events-none z-20">
          <div className="w-full max-w-sm flex justify-end gap-6 text-sm font-medium text-slate-600 pointer-events-auto pr-2">
            <a href="#about" className="hover:text-blue-600 transition-colors">About Us</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact Us</a>
          </div>
        </div>

        {/* Floating white card */}
        <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 lg:p-7 animate-fade-in border border-slate-100">

          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Log In</h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Sign in with your Email or PRN number
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">

            {/* Email / PRN */}
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email or PRN Number"
                required
                autoComplete="off"
                className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">👤</span>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-bold">
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs px-3 py-2 rounded-xl font-semibold">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md hover:bg-slate-800"
              style={{ background: '#0f172a' }}
            >
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                : 'Log In'
              }
            </button>
          </form>

          <p className="text-center text-[11px] font-semibold text-slate-400 mt-4">
            Student accounts are provided by your institution.
          </p>
        </div>
      </div>
      </div>

      {/* ── About Us Section ── */}
      <div id="about" className="py-24 px-6 lg:px-12 relative overflow-hidden" style={{ background: '#e8eef4' }}>
        <WaveLines />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>About Us</h2>
            <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-white/60 backdrop-blur p-8 rounded-3xl border border-white/80 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">CDAC Kharghar</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Centre for Development of Advanced Computing (C-DAC) is the premier R&D organization of the Ministry of Electronics and Information Technology (MeitY) for carrying out R&D in IT, Electronics and associated areas. C-DAC Kharghar is a prominent center dedicated to nurturing talent, driving innovation, and providing top-tier technological education and training to shape the IT professionals of tomorrow.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur p-8 rounded-3xl border border-white/80 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">CDAC Spark</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                CDAC Spark is a next-generation unified examination and learning platform built specifically for CDAC. It offers a seamless experience for preparation, proctored assessments, and detailed performance tracking. Designed to bridge the gap between students and faculty, it ensures exams get aced the smartest way possible.
              </p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur rounded-3xl p-10 shadow-sm border border-white/80">
            <h3 className="text-2xl font-bold mb-8 text-center text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>The Team Behind Spark</h3>
            
            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 text-center">Project Mentor</h4>
              <div className="flex justify-center">
                <div className="bg-white/80 px-6 py-3 rounded-xl border border-white/80 shadow-sm">
                  <span className="font-bold text-lg text-blue-600">Vipul Tembulwar</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 text-center">Developers</h4>
              <div className="flex flex-wrap justify-center gap-3">
                {['Prabal Soni', 'Prachi Rai', 'Parag Hande', 'Janhavi Palsapure', 'Gayatree Ghadage', 'Dwarka Khole'].map(dev => (
                  <div key={dev} className="bg-white/80 px-5 py-2.5 rounded-xl border border-white/80 shadow-sm text-slate-700 text-sm font-semibold hover:bg-white transition-colors">
                    {dev}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact Us Section ── */}
      <div id="contact" className="py-24 px-6 lg:px-12 relative overflow-hidden" style={{ background: '#e8eef4' }}>
        <WaveLines />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>Contact Us</h2>
          <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full mb-12"></div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur p-6 rounded-3xl shadow-sm border border-white/80">
              <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-white">
                <span className="text-xl">📍</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Visit Us</h3>
              <p className="text-sm text-slate-600">C-DAC Kharghar,<br/>Navi Mumbai, Maharashtra</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur p-6 rounded-3xl shadow-sm border border-white/80">
              <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-white">
                <span className="text-xl">✉️</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Email Us</h3>
              <p className="text-sm text-slate-600">support@cdac.in<br/>spark@cdac.in</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur p-6 rounded-3xl shadow-sm border border-white/80">
              <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-white">
                <span className="text-xl">📞</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Call Us</h3>
              <p className="text-sm text-slate-600">+91 022 2756 5303<br/>Mon-Fri, 9am - 5pm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500 relative z-10 border-t border-white/40" style={{ background: '#e8eef4' }}>
        © {new Date().getFullYear()} CDAC Spark. All rights reserved.
      </footer>
    </div>
  )
}
