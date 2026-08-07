import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentService } from '../../services/studentService'
import {
  User, Mail, Phone, Calendar,
  Edit3, Save, X, Shield, Lock, GraduationCap, Building2, Users
} from 'lucide-react'

export default function StudentProfile() {
  const { user }              = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    name:   '',
    email:  '',
    phone:  '',
    batch:  '',
    course: '',
    prn:    '',
    institute: 'CDAC Mumbai',
    dob: '2001-08-15'
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentService.getProfile()
        if (res && res.email) {
          const p = res
          setForm(prev => ({
            ...prev,
            name:   p.fullName   || user?.fullName   || 'Prabal Soni',
            email:  p.email      || user?.email      || 'prabal.soni@students.cdac.in',
            phone:  p.phone      || user?.phone      || '+91 9876543210',
            batch:  p.batchName  || user?.batchName  || 'PG-DAC Sept 2023',
            course: p.courseName || user?.courseName || 'PG-DAC',
            prn:    p.prn        || user?.prn        || '230940120001',
          }))
        }
      } catch (err) {
        setForm(prev => ({
          ...prev,
          name:   user?.fullName   || 'Prabal Soni',
          email:  user?.email      || 'prabal.soni@students.cdac.in',
          batch:  user?.batchName  || 'PG-DAC Sept 2023',
          course: user?.courseName || 'PG-DAC',
          prn:    user?.prn        || '230940120001',
        }))
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setEditing(false)
    // Add API save logic here
  }

  const displayName = form.name || 'Prabal Soni'
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account</p>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 via-indigo-500 to-[#d97743] p-8 shadow-sm h-48 flex items-center">
        {/* Decorative circle */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/10 rounded-l-full blur-2xl transform translate-x-1/3"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <span className="text-3xl font-bold text-white tracking-widest">{initials}</span>
            </div>
          </div>
          
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
            <p className="text-white/90 text-sm mb-3 font-medium tracking-wide">
              {form.prn} &middot; {form.course}
            </p>
            <div className="flex gap-2 text-xs font-bold tracking-wide">
              <span className="bg-white/20 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-md shadow-sm">
                {form.batch}
              </span>
              <span className="bg-white/20 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-md shadow-sm">
                {form.institute}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mt-8">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
            <h3 className="text-xl font-bold text-slate-800">Personal Information</h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Field Helper */}
            {([
              { label: 'Full Name', key: 'name', icon: User, type: 'text' },
              { label: 'PRN Number', key: 'prn', icon: Shield, type: 'text' },
              { label: 'Email Address', key: 'email', icon: Mail, type: 'email' },
              { label: 'Phone Number', key: 'phone', icon: Phone, type: 'tel' },
              { label: 'Course', key: 'course', icon: GraduationCap, type: 'text' },
              { label: 'Batch', key: 'batch', icon: Users, type: 'text' },
              { label: 'Institute', key: 'institute', icon: Building2, type: 'text' },
              { label: 'Date of Birth', key: 'dob', icon: Calendar, type: 'date' },
            ] as const).map(field => (
              <div key={field.key}>
                <label className="flex items-center gap-2 text-[13px] font-bold text-slate-500 mb-2">
                  <field.icon className="w-4 h-4 text-slate-400" />
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  disabled={!editing || field.key === 'prn' || field.key === 'email'}
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/80 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-100 disabled:cursor-not-allowed transition-all shadow-sm"
                />
              </div>
            ))}

          </div>
        </div>

    </div>
  )
}
