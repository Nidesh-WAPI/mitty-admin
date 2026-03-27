import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

const STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-700', confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-purple-100 text-purple-700', shipped: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700', returned: 'bg-gray-100 text-gray-700',
}
const STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)

  const page = Number(searchParams.get('page') || 1)
  const status = searchParams.get('status') || ''
  const search = searchParams.get('search') || ''

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (status) params.status = status
    if (search) params.search = search
    api.get('/orders/admin/all', { params })
      .then(({ data }) => { setOrders(data.orders); setPagination(data.pagination) })
      .finally(() => setLoading(false))
  }, [page, status, search])

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} orders total</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search order number..."
          defaultValue={search}
          onKeyDown={(e) => { if (e.key === 'Enter') setParam('search', e.target.value) }}
          className="input w-56"
        />
        <select value={status} onChange={(e) => setParam('status', e.target.value)} className="input w-44">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setParam('status', '')} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!status ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setParam('status', s)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${status === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{s}</button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" className="py-16" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Order</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Items</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Payment</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Date</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td font-medium text-primary-600">#{order.orderNumber}</td>
                    <td className="table-td">
                      <p className="font-medium text-gray-900">{order.user?.name}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="table-td text-gray-500">{order.items?.length}</td>
                    <td className="table-td font-semibold">₹{order.total?.toLocaleString('en-IN')}</td>
                    <td className="table-td">
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="table-td text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="table-td">
                      <Link to={`/orders/${order._id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <div className="text-center py-12 text-gray-400">No orders found</div>}
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => { const ps = new URLSearchParams(searchParams); ps.set('page', p); setSearchParams(ps) }} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  )
}
