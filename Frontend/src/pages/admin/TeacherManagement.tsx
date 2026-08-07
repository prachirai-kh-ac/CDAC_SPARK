import { useState, useEffect } from 'react'
import {
  Users, Plus, Edit2, Key, Power, Trash2,
  CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react'
import api from '../../services/api'

interface Teacher {
  id: string
  fullName: string
  username: string
  email: string
  phoneNumber: string
  isActive: boolean
  createdAt: string
  lastLogin: string | null
}

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Forms
  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', phoneNumber: '', password: '', confirmPassword: ''
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/teachers')
      if (res.data.success && res.data.data.length > 0) {
        setTeachers(res.data.data)
      } else {
        setTeachers([])
      }
    } catch (err: any) {
      console.error(err)
      setTeachers([])
      setError('Failed to fetch teachers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setFormData({ fullName: '', username: '', email: '', phoneNumber: '', password: '', confirmPassword: '' })
    setFormError('')
    setFormSuccess('')
  }

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    
    if (!formData.fullName || !formData.username || !formData.email || !formData.phoneNumber || !formData.password || !formData.confirmPassword) {
      setFormError('All fields are mandatory.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Password and Confirm Password must match.')
      return
    }

    try {
      await api.post('/admin/teachers', formData)
      setFormSuccess('Teacher account created successfully.')
      resetForm()
      setShowAddModal(false)
      fetchTeachers()
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create teacher.')
    }
  }

  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    try {
      await api.put(`/admin/teachers/${selectedTeacher?.id}`, {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      })
      setShowEditModal(false)
      fetchTeachers()
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update teacher.')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    try {
      await api.put(`/admin/teachers/${selectedTeacher?.id}/reset-password`, { 
        newPassword: formData.password 
      })
      setShowResetModal(false)
      resetForm()
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to reset password.')
    }
  }

  const deleteTeacher = (id: string) => {
    setSelectedTeacher(teachers.find(t => t.id === id) || null)
    setShowDeleteModal(true)
  }

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return
    try {
      await api.delete(`/admin/teachers/${selectedTeacher.id}`)
      setShowDeleteModal(false)
      fetchTeachers()
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.message || "Failed to delete teacher")
    }
  }

  const suspendTeacher = async (id: string) => {
    if (!window.confirm("Are you sure you want to suspend this teacher?\nThe teacher will not be able to log in until reactivated.")) return
    try {
      await api.patch(`/admin/teachers/${id}/suspend`)
      fetchTeachers()
    } catch (err) {
      console.error(err)
      alert("Failed to suspend teacher")
    }
  }

  const activateTeacher = async (id: string) => {
    if (!window.confirm("Are you sure you want to activate this teacher?\nThe teacher will be able to log in again.")) return
    try {
      await api.patch(`/admin/teachers/${id}/activate`)
      fetchTeachers()
    } catch (err) {
      console.error(err)
      alert("Failed to activate teacher")
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = teachers.map(t => t.id)
      const newSelected = [...new Set([...selectedIds, ...visibleIds])]
      setSelectedIds(newSelected)
    } else {
      const visibleIds = new Set(teachers.map(t => t.id))
      setSelectedIds(selectedIds.filter(id => !visibleIds.has(id)))
    }
  }

  const handleSelectOne = (e: React.SyntheticEvent, id: string) => {
    e.stopPropagation()
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selId => selId !== id) : [...prev, id])
  }

  const handleRowClick = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selId => selId !== id) : [...prev, id])
  }

  const bulkSuspend = async () => {
    if (!window.confirm(`Are you sure you want to suspend ${selectedIds.length} selected teachers?\nThey will no longer be able to log in until activated.`)) return
    try {
      await api.patch('/admin/teachers/bulk/suspend', { teacherIds: selectedIds })
      fetchTeachers()
      alert(`${selectedIds.length} teachers suspended successfully.`)
    } catch (err) {
      console.error(err)
      alert("Failed to suspend teachers")
    }
  }

  const bulkActivate = async () => {
    if (!window.confirm(`Are you sure you want to activate ${selectedIds.length} selected teachers?`)) return
    try {
      await api.patch('/admin/teachers/bulk/activate', { teacherIds: selectedIds })
      fetchTeachers()
      alert(`${selectedIds.length} teachers activated successfully.`)
    } catch (err) {
      console.error(err)
      alert("Failed to activate teachers")
    }
  }

  const bulkDelete = async () => {
    if (!window.confirm(`WARNING\n\nYou are about to delete ${selectedIds.length} teachers.\nThis action cannot be undone.\n\nDo you want to continue?`)) return
    try {
      await api.delete('/admin/teachers/bulk', { data: { teacherIds: selectedIds } })
      setSelectedIds([])
      fetchTeachers()
      alert(`${selectedIds.length} teachers deleted successfully.`)
    } catch (err) {
      console.error(err)
      alert("Failed to delete teachers")
    }
  }

  const openEditModal = (t: Teacher) => {
    setSelectedTeacher(t)
    setFormData({ ...formData, fullName: t.fullName, username: t.username, email: t.email, phoneNumber: t.phoneNumber || '' })
    setShowEditModal(true)
  }

  const openResetModal = (t: Teacher) => {
    setSelectedTeacher(t)
    resetForm()
    setShowResetModal(true)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Teacher Management</h1>
          <p className="text-slate-500 text-sm mt-1">{teachers.length} teachers registered</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true) }}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Teacher
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded-md text-sm">{selectedIds.length}</span>
            <span className="text-blue-900 font-medium text-sm">Teachers Selected</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={bulkSuspend} className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm font-medium transition-colors">
              Suspend Selected
            </button>
            <button onClick={bulkActivate} className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm font-medium transition-colors">
              Activate Selected
            </button>
            <button onClick={bulkDelete} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors">
              Delete Selected
            </button>
            <div className="w-px h-6 bg-blue-200 mx-1"></div>
            <button onClick={() => setSelectedIds([])} className="px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors">
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    onChange={handleSelectAll}
                    checked={teachers.length > 0 && teachers.every(t => selectedIds.includes(t.id))}
                    ref={input => { if (input) input.indeterminate = teachers.some(t => selectedIds.includes(t.id)) && !teachers.every(t => selectedIds.includes(t.id)) }}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Full Name</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Phone Number</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Created Date</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-500">Loading teachers...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-500">No teachers found.</td></tr>
              ) : (
                teachers.map(t => (
                  <tr 
                    key={t.id} 
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedIds.includes(t.id) ? 'bg-blue-50/50' : ''}`}
                    onClick={() => handleRowClick(t.id)}
                  >
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedIds.includes(t.id)}
                        onChange={(e) => handleSelectOne(e, t.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {t.fullName.charAt(0)}
                      </div>
                      {t.fullName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{t.username}</td>
                    <td className="px-6 py-4 text-slate-600">{t.email}</td>
                    <td className="px-6 py-4 text-slate-600">{t.phoneNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        t.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {t.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {t.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openResetModal(t)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium text-xs transition-colors" title="Reset Password">
                          Reset Pass
                        </button>
                        {t.isActive ? (
                          <button
                            onClick={() => suspendTeacher(t.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 font-medium text-xs transition-colors"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => activateTeacher(t.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium text-xs transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => deleteTeacher(t.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Add New Teacher</h2>
            </div>
            <form onSubmit={handleCreateTeacher} className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{formError}</div>}
              {formSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200">{formSuccess}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required className="input-field" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl border font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border font-medium text-amber-600 hover:bg-amber-50">Reset</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 font-medium text-white hover:bg-blue-700">Create Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Edit Teacher</h2>
            </div>
            <form onSubmit={handleEditTeacher} className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{formError}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="input-field" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-xl border font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 font-medium text-white hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Reset Password</h2>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{formError}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required className="input-field" />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowResetModal(false)} className="px-5 py-2.5 rounded-xl border font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-amber-600 font-medium text-white hover:bg-amber-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in text-center p-8">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Delete Teacher?</h2>
            <p className="text-slate-500 mb-8">Are you sure you want to delete this teacher account? Questions and test data created by them will remain in the system.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl border font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleDeleteTeacher} className="flex-1 py-3 rounded-xl bg-red-600 font-semibold text-white hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
