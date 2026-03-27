import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

const STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
const STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-700', confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-purple-100 text-purple-700', shipped: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
}

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [statusForm, setStatusForm] = useState({ orderStatus: '', note: '', trackingNumber: '', courierPartner: '', estimatedDelivery: '' })

  useEffect(() => {
    api.get(`/orders/admin/${id}`).then(({ data }) => {
      setOrder(data.order)
      setStatusForm(f => ({ ...f, orderStatus: data.order.orderStatus }))
    }).finally(() => setLoading(false))
  }, [id])

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const { data } = await api.put(`/orders/admin/${id}/status`, statusForm)
      setOrder(data.order)
      toast.success('Order status updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" className="py-20" />
  if (!order) return null

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/orders" className="text-gray-500 hover:text-gray-700">←</Link>
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
        <span className={`badge text-sm ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>{order.orderStatus}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <img src={item.image || 'https://placehold.co/56'} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.size && `Size: ${item.size}`} · Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
            <hr className="my-4 border-gray-100" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount.toLocaleString('en-IN')}</span></div>}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>₹{order.total.toLocaleString('en-IN')}</span></div>
            </div>
          </div>

          {/* Update Status */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Update Order Status</h2>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={statusForm.orderStatus} onChange={(e) => setStatusForm({ ...statusForm, orderStatus: e.target.value })} className="input">
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
                  <input value={statusForm.note} onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })} className="input" placeholder="e.g. Dispatched via BlueDart" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tracking Number</label>
                  <input value={statusForm.trackingNumber} onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })} className="input" placeholder="AWB number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Courier Partner</label>
                  <input value={statusForm.courierPartner} onChange={(e) => setStatusForm({ ...statusForm, courierPartner: e.target.value })} className="input" placeholder="BlueDart, DTDC, etc." />
                </div>
              </div>
              <button type="submit" disabled={updating} className="btn-primary">
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>

          {/* Status History */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Status History</h2>
            <div className="space-y-3">
              {order.statusHistory?.slice().reverse().map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{h.status}</p>
                    {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
                    <p className="text-xs text-gray-400">{new Date(h.updatedAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Customer</h3>
            <p className="text-sm font-medium text-gray-900">{order.user?.name}</p>
            <p className="text-sm text-gray-500">{order.user?.email}</p>
            <p className="text-sm text-gray-500">{order.user?.phone}</p>
            <Link to={`/customers/${order.user?._id}`} className="text-xs text-primary-600 mt-2 inline-block">View Customer →</Link>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
            <p className="text-sm font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.phone}</p>
            <p className="text-sm text-gray-600 mt-1">{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && <p className="text-sm text-gray-600">{order.shippingAddress?.addressLine2}</p>}
            <p className="text-sm text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Payment</h3>
            <p className="text-sm text-gray-700 capitalize">{order.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</p>
            <span className={`badge mt-1 ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.paymentStatus}</span>
            {order.razorpayPaymentId && <p className="text-xs text-gray-400 mt-2">ID: {order.razorpayPaymentId}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
