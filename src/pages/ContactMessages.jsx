import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
}

export default function ContactMessages() {
  const [messages, setMessages] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [editForm, setEditForm] = useState({ status: '', adminNotes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (filter) params.status = filter
    api.get('/contact/admin', { params })
      .then(({ data }) => { setMessages(data.messages); setPagination(data.pagination) })
      .finally(() => setLoading(false))
  }, [filter])

  const handleExpand = (msg) => {
    setExpanded(msg._id === expanded?._id ? null : msg)
    setEditForm({ status: msg.status, adminNotes: msg.adminNotes || '' })
  }

  const handleUpdate = async (id) => {
    setSaving(true)
    try {
      const { data } = await api.put(`/contact/admin/${id}`, editForm)
      setMessages(messages.map(m => m._id === id ? data.message : m))
      toast.success('Message updated')
      setExpanded(null)
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} messages</p>
      </div>

      <div className="flex gap-2">
        {[{ val: '', label: 'All' }, { val: 'new', label: 'New' }, { val: 'in_progress', label: 'In Progress' }, { val: 'resolved', label: 'Resolved' }].map(({ val, label }) => (
          <button key={val} onClick={() => setFilter(val)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === val ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner size="lg" className="py-16" /> : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg._id} className="card overflow-hidden">
              <button onClick={() => handleExpand(msg)} className="w-full p-5 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{msg.name}</span>
                      <span className={`badge ${STATUS_COLORS[msg.status] || 'bg-gray-100 text-gray-600'}`}>{msg.status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{msg.email}{msg.phone && ` · ${msg.phone}`}</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">{msg.subject}</p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{new Date(msg.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </button>

              {expanded?._id === msg._id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Message</p>
                    <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-3">{msg.message}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                      <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="input">
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Internal Notes</label>
                      <input value={editForm.adminNotes} onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })} className="input" placeholder="Notes visible to admin only" />
                    </div>
                  </div>
                  <button onClick={() => handleUpdate(msg._id)} disabled={saving} className="btn-primary text-sm">
                    {saving ? 'Saving...' : 'Update'}
                  </button>
                </div>
              )}
            </div>
          ))}
          {messages.length === 0 && <div className="card p-12 text-center text-gray-400">No messages found</div>}
        </div>
      )}
    </div>
  )
}
