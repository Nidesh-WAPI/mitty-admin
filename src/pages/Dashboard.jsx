import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/axios'
import StatsCard from '../components/StatsCard'
import LoadingSpinner from '../components/LoadingSpinner'

const ORDER_STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-700', confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-purple-100 text-purple-700', shipped: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, salesRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/sales-report?period=30'),
        ])
        setData(dashRes.data.dashboard)
        setSalesData(salesRes.data.salesByDay)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner size="lg" className="py-20" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" value={`₹${(data?.revenue?.total || 0).toLocaleString('en-IN')}`} sub={`₹${(data?.revenue?.thisMonth || 0).toLocaleString('en-IN')} this month`} icon="💰" color="green" />
        <StatsCard title="Total Orders" value={data?.orders?.total || 0} sub={`${data?.orders?.today || 0} today · ${data?.orders?.pending || 0} pending`} icon="📦" color="blue" />
        <StatsCard title="Customers" value={data?.customers?.total || 0} icon="👥" color="purple" />
        <StatsCard title="Products" value={data?.products?.total || 0} sub={data?.products?.lowStock > 0 ? `${data.products.lowStock} low stock` : 'All stocked'} icon="👕" color={data?.products?.lowStock > 0 ? 'red' : 'amber'} />
      </div>

      {/* Alerts */}
      {(data?.products?.lowStock > 0 || data?.abandonedPayments > 0) && (
        <div className="space-y-3">
          {data?.products?.lowStock > 0 && (
            <div className="card p-4 border-l-4 border-amber-400 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{data.products.lowStock} products are low on stock</p>
                  <p className="text-xs text-gray-500">Review and restock soon</p>
                </div>
              </div>
              <Link to="/inventory?lowStock=true" className="btn-outline text-xs">View →</Link>
            </div>
          )}
          {data?.abandonedPayments > 0 && (
            <div className="card p-4 border-l-4 border-red-400 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">💳</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{data.abandonedPayments} abandoned payments need follow-up</p>
                  <p className="text-xs text-gray-500">Send WhatsApp/email to recover orders</p>
                </div>
              </div>
              <Link to="/abandoned-payments" className="btn-outline text-xs">View →</Link>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-gray-900 mb-4">Revenue (Last 30 days)</h2>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>
          )}
        </div>

        {/* Low stock */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Low Stock Alert</h2>
            <Link to="/inventory?lowStock=true" className="text-xs text-primary-600">View all</Link>
          </div>
          {data?.lowStockProducts?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">All products well stocked ✓</p>
          ) : (
            <div className="space-y-3">
              {data?.lowStockProducts?.slice(0, 6).map((p) => (
                <div key={p._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={p.images?.[0] || 'https://placehold.co/32'} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{p.name}</span>
                  </div>
                  <span className={`badge shrink-0 ml-2 ${p.totalStock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.totalStock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-primary-600 hover:text-primary-700">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-th">Order</th>
                <th className="table-th">Customer</th>
                <th className="table-th">Amount</th>
                <th className="table-th">Status</th>
                <th className="table-th">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders?.map((order) => (
                <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="table-td">
                    <Link to={`/orders/${order._id}`} className="font-medium text-primary-600 hover:text-primary-700">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="table-td">{order.user?.name || 'N/A'}</td>
                  <td className="table-td font-semibold">₹{order.total?.toLocaleString('en-IN')}</td>
                  <td className="table-td">
                    <span className={`badge ${ORDER_STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="table-td text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
