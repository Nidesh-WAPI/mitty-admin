import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchReviews = () => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (filter !== '') params.isApproved = filter
    api.get('/reviews/admin/all', { params })
      .then(({ data }) => { setReviews(data.reviews); setPagination(data.pagination) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [page, filter])

  const handleApprove = async (review) => {
    try {
      await api.put(`/reviews/admin/${review._id}/approve`, { isApproved: !review.isApproved })
      setReviews(reviews.map(r => r._id === review._id ? { ...r, isApproved: !r.isApproved } : r))
      toast.success(review.isApproved ? 'Review hidden' : 'Review approved')
    } catch {
      toast.error('Failed to update review')
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await api.delete(`/reviews/${reviewId}`)
      setReviews(reviews.filter(r => r._id !== reviewId))
      toast.success('Review deleted')
    } catch {
      toast.error('Failed to delete review')
    }
  }

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} reviews total</p>
      </div>

      <div className="flex gap-2">
        {[{ val: '', label: 'All' }, { val: 'true', label: 'Approved' }, { val: 'false', label: 'Hidden' }].map(({ val, label }) => (
          <button key={val} onClick={() => { setFilter(val); setPage(1) }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === val ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner size="lg" className="py-16" /> : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className={`card p-5 ${!review.isApproved ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {review.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{review.user?.name}</span>
                      <span className="text-gray-400 text-sm mx-2">·</span>
                      <span className="text-amber-400 font-bold">{renderStars(review.rating)}</span>
                    </div>
                    {review.isVerifiedPurchase && (
                      <span className="badge bg-green-100 text-green-700 text-xs">✓ Verified Purchase</span>
                    )}
                    {!review.isApproved && (
                      <span className="badge bg-gray-100 text-gray-500 text-xs">Hidden</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    Product: <span className="text-gray-600 font-medium">{review.product?.name}</span>
                    <span className="mx-2">·</span>
                    {new Date(review.createdAt).toLocaleDateString('en-IN')}
                  </p>
                  {review.title && <p className="font-medium text-gray-900 mb-1">{review.title}</p>}
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => handleApprove(review)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${review.isApproved ? 'border border-gray-300 text-gray-600 hover:bg-gray-50' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                    {review.isApproved ? 'Hide' : 'Approve'}
                  </button>
                  <button onClick={() => handleDelete(review._id)} className="text-xs px-3 py-1.5 rounded-lg font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="card p-12 text-center text-gray-400">No reviews found</div>
          )}
        </div>
      )}
    </div>
  )
}
