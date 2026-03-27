import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AbandonedPayments() {
  const [attempts, setAttempts] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('false') // followUpSent
  const [followUpModal, setFollowUpModal] = useState(null)
  const [followUpForm, setFollowUpForm] = useState({ method: 'whatsapp', notes: '' })
  const [saving, setSaving] = useState(false)

  const fetch = () => {
    setLoading(true)
    const params = {}
    if (filter !== '') params.followUpSent = filter
    api.get('/payments/abandoned', { params })
      .then(({ data }) => { setAttempts(data.attempts); setPagination(data.pagination) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [filter])

  const handleMarkFollowUp = async () => {
    setSaving(true)
    try {
      const { data } = await api.put(`/payments/attempts/${followUpModal._id}/follow-up`, followUpForm)
      setAttempts(attempts.map(a => a._id === followUpModal._id ? data.attempt : a))
      toast.success('Follow-up recorded')
      setFollowUpModal(null)
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Abandoned Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Users who started checkout but didn't complete payment</p>
      </div>

      <div className="flex gap-2">
        {[{ val: 'false', label: 'Needs Follow-up' }, { val: 'true', label: 'Follow-up Done' }, { val: '', label: 'All' }].map(({ val, label }) => (
          <button key={val} onClick={() => setFilter(val)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === val ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner size="lg" className="py-16" /> : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div key={attempt._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                      {attempt.user?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{attempt.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{attempt.user?.email}</p>
                    </div>
                    <span className={`badge ${attempt.status === 'abandoned' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {attempt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Order Value</p>
                      <p className="font-semibold text-gray-900">₹{attempt.totalAmount?.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-gray-700">{attempt.user?.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="text-gray-700">{new Date(attempt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  {attempt.followUpSent && (
                    <div className="mt-3 px-3 py-2 bg-green-50 rounded-lg text-xs text-green-700">
                      ✓ Follow-up sent via {attempt.followUpMethod} on {new Date(attempt.followUpSentAt).toLocaleDateString('en-IN')}
                      {attempt.notes && <span className="ml-2 text-green-600">· {attempt.notes}</span>}
                    </div>
                  )}
                </div>

                {!attempt.followUpSent && (
                  <button
                    onClick={() => { setFollowUpModal(attempt); setFollowUpForm({ method: 'whatsapp', notes: '' }) }}
                    className="btn-primary text-xs shrink-0"
                  >
                    Mark Follow-up
                  </button>
                )}
              </div>
            </div>
          ))}
          {attempts.length === 0 && <div className="card p-12 text-center text-gray-400">No records found</div>}
        </div>
      )}

      {/* Follow-up modal */}
      {followUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1">Record Follow-up</h3>
            <p className="text-sm text-gray-500 mb-4">
              {followUpModal.user?.name} - ₹{followUpModal.totalAmount?.toLocaleString('en-IN')}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Method</label>
                <select value={followUpForm.method} onChange={(e) => setFollowUpForm({ ...followUpForm, method: e.target.value })} className="input">
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea value={followUpForm.notes} onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })} rows={3} className="input resize-none" placeholder="e.g. Customer said they'll order tomorrow" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleMarkFollowUp} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setFollowUpModal(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
