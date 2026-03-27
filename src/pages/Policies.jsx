import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

const POLICY_TYPES = [
  { type: 'return', label: 'Return Policy' },
  { type: 'refund', label: 'Refund Policy' },
  { type: 'exchange', label: 'Exchange Policy' },
  { type: 'shipping', label: 'Shipping Policy' },
  { type: 'privacy', label: 'Privacy Policy' },
  { type: 'terms', label: 'Terms & Conditions' },
]

export default function Policies() {
  const [activeType, setActiveType] = useState('return')
  const [policies, setPolicies] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })

  useEffect(() => {
    api.get('/policies')
      .then(({ data }) => {
        const map = {}
        data.policies.forEach(p => { map[p.type] = p })
        setPolicies(map)
        const current = map['return']
        if (current) setForm({ title: current.title, content: current.content })
        else setForm({ title: 'Return Policy', content: '' })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleTypeChange = (type) => {
    setActiveType(type)
    const p = policies[type]
    const defaultTitle = POLICY_TYPES.find(pt => pt.type === type)?.label || ''
    setForm({ title: p?.title || defaultTitle, content: p?.content || '' })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put(`/policies/${activeType}`, { ...form, type: activeType, isActive: true })
      setPolicies({ ...policies, [activeType]: data.policy })
      toast.success('Policy saved')
    } catch {
      toast.error('Failed to save policy')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" className="py-20" />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Policies</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Policy type selector */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Policy Type</h2>
          <div className="space-y-1">
            {POLICY_TYPES.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${activeType === type ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {label}
                {policies[type] && <span className="text-xs text-green-500">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{POLICY_TYPES.find(p => p.type === activeType)?.label}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Content (HTML supported)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={14}
              className="input resize-y font-mono text-xs"
              placeholder="<h2>Policy Title</h2><p>Policy content...</p>"
            />
          </div>

          {/* Preview */}
          {form.content && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
              <div
                className="border border-gray-200 rounded-lg p-4 text-sm
                  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-2
                  [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mb-1
                  [&_p]:text-gray-600 [&_p]:mb-2
                  [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2
                  [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2
                  [&_li]:text-gray-600 [&_li]:mb-1
                  [&_strong]:text-gray-900"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            </div>
          )}

          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Policy'}
          </button>
        </div>
      </div>
    </div>
  )
}
