import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Customers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)

  const page = Number(searchParams.get('page') || 1)
  const search = searchParams.get('search') || ''

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (search) params.search = search
    api.get('/admin/customers', { params })
      .then(({ data }) => { setCustomers(data.customers); setPagination(data.pagination) })
      .finally(() => setLoading(false))
  }, [page, search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} customers total</p>
      </div>

      <div className="card p-4">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const p = new URLSearchParams(searchParams)
              if (e.target.value) p.set('search', e.target.value); else p.delete('search')
              p.delete('page')
              setSearchParams(p)
            }
          }}
          className="input w-80"
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? <LoadingSpinner size="lg" className="py-16" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">Joined</th>
                  <th className="table-th">Status</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-500">{c.phone || '—'}</td>
                    <td className="table-td text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="table-td">
                      <span className={`badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-td">
                      <Link to={`/customers/${c._id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customers.length === 0 && <div className="text-center py-12 text-gray-400">No customers found</div>}
          </div>
        )}
      </div>
    </div>
  )
}
