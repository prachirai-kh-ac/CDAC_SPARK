import { useState, useEffect } from 'react'
import {
  Layers, Plus, Edit3, Trash2,
  Users, BookOpen, Calendar,
  X, Save, TrendingUp
} from 'lucide-react'
import api from '../../services/api'

const months = ['Feb', 'Aug']
const years = Array.from({ length: 11 }, (_, i) => (2020 + i).toString())



export default function BatchManagement() {
  const [batches, setBatches] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editBatch, setEditBatch] = useState<any | null>(null)
  
  const [form, setForm] = useState({
    month: 'Feb',
    year: '2026'
  })

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches')
      if (res.data && res.data.success) {
        setBatches(res.data.data)
      } else {
        setBatches([])
      }
    } catch (err) {
      console.error(err)
      setBatches([])
    }
  }

  const openAdd = () => {
    setEditBatch(null)
    setForm({ month: 'Feb', year: '2026' })
    setShowModal(true)
  }

  const handleSave = async () => {
    const generatedName = `${form.month} ${form.year}`
    try {
      if (editBatch) {
        await api.put(`/batches/${editBatch.id}`, { name: generatedName })
        fetchBatches()
      } else {
        await api.post('/batches', {
          name: generatedName,
          courseId: 1, // Fallback course
          startDate: new Date(`${form.year}-${form.month === 'Feb' ? '02' : '08'}-01`).toISOString(),
          endDate: new Date(`${form.year}-${form.month === 'Feb' ? '07' : '01'}-31`).toISOString()
        })
        fetchBatches()
      }
      setShowModal(false)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving batch. Batch name might already exist.')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this batch?')) {
      try {
        await api.delete(`/batches/${id}`)
        fetchBatches()
      } catch (err) {
        console.error('Error deleting batch', err)
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Batch Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">{batches.length} batches registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Batch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Batches', value: batches.length,                                       color: 'text-primary-600', bg: 'bg-primary-50'  },
          { label: 'Active',        value: batches.filter(b => b.status === 'Active').length,    color: 'text-emerald-600', bg: 'bg-emerald-50'  },
          { label: 'Total Students',value: batches.reduce((a, b) => a + (b.studentCount || 0), 0),          color: 'text-blue-600',    bg: 'bg-blue-50'     },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
              <Layers className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Batch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map(batch => (
          <div key={batch.id} className="card hover:shadow-card-hover transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 text-lg">{batch.name}</h3>
                  <span className={`badge ${
                    batch.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {batch.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditBatch(batch)
                    const parts = batch.name.split(' ')
                    setForm({ month: parts[0] || 'Feb', year: parts[1] || '2026' })
                    setShowModal(true)
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(batch.id)}
                  className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {batch.studentCount || 0} Students
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(batch.startDate).toLocaleDateString()}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-surface-100">
              <h3 className="font-semibold text-slate-900">
                {editBatch ? 'Edit Batch' : 'Create New Batch'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Month</label>
                <select
                  value={form.month}
                  onChange={e => setForm(p => ({ ...p, month: e.target.value }))}
                  className="input-field"
                >
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Year</label>
                <select
                  value={form.year}
                  onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                  className="input-field"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500">Generated Batch Name:</p>
                <p className="text-lg font-bold text-slate-900">{form.month} {form.year}</p>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-surface-100">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleSave}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Save className="w-4 h-4" />
                Create Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
