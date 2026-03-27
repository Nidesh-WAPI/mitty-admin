import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

export default function CustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/admin/customers/${id}`)
      .then(({ data }) => { setCustomer(data.customer); setOrders(data.orders) })
      .finally(() => setLoading(false))
  }, [id])

  const handleToggle = async () => {
    try {
      const { data } = await api.put(`/admin/customers/${id}/toggle`)
      setCustomer(data.customer)
      toast.success(`Customer ${data.customer.isActive ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update customer status')
    }
  }

  if (loading) return <LoadingSpinner size="lg" className="py-20" />
  if (!customer) return null

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/customers" className="text-gray-500 hover:text-gray-700">←</Link>
        <h1 className="text-2xl font-bold text-gray-900">Customer Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-2xl font-bold mx-auto mb-3">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-bold text-gray-900">{customer.name}</h2>
            <p className="text-sm text-gray-500">{customer.email}</p>
            {customer.phone && <p className="text-sm text-gray-500">{customer.phone}</p>}
            <span className={`badge mt-2 ${customer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {customer.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-gray-400 text-center">Joined {new Date(customer.createdAt).toLocaleDateString('en-IN')}</p>
          <button onClick={handleToggle} className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-colors ${customer.isActive ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'border border-green-200 text-green-600 hover:bg-green-50'}`}>
            {customer.isActive ? 'Deactivate Account' : 'Activate Account'}
          </button>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <Link to={`/orders/${order._id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                        #{order.orderNumber}
                      </Link>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₹{order.total?.toLocaleString('en-IN')}</p>
                      <span className={`badge text-xs ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
