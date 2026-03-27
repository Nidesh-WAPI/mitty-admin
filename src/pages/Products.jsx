import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])

  const page = Number(searchParams.get('page') || 1)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (search) params.search = search
      if (category) params.category = category
      const { data } = await api.get('/products/admin/all', { params })
      setProducts(data.products)
      setPagination(data.pagination)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories))
  }, [])

  useEffect(() => { fetchProducts() }, [page, search, category])

  const handleToggleActive = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { isActive: !product.isActive })
      setProducts(products.map(p => p._id === product._id ? { ...p, isActive: !p.isActive } : p))
      toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update product')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} products total</p>
        </div>
        <Link to="/products/new" className="btn-primary flex items-center gap-2">
          <span>+</span> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search products..."
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const p = new URLSearchParams(searchParams)
              if (e.target.value) p.set('search', e.target.value); else p.delete('search')
              p.delete('page')
              setSearchParams(p)
            }
          }}
          className="input w-64"
        />
        <select
          value={category}
          onChange={(e) => {
            const p = new URLSearchParams(searchParams)
            if (e.target.value) p.set('category', e.target.value); else p.delete('category')
            p.delete('page')
            setSearchParams(p)
          }}
          className="input w-48"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" className="py-16" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Product</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Price</th>
                  <th className="table-th">Stock</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://placehold.co/48'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 max-w-[180px] truncate">{p.name}</p>
                          {p.isFeatured && <span className="badge bg-amber-100 text-amber-700 text-xs">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-500">{p.category?.name}</td>
                    <td className="table-td">
                      <p className="font-semibold">₹{(p.discountedPrice || p.basePrice).toLocaleString('en-IN')}</p>
                      {p.discountedPrice && <p className="text-xs text-gray-400 line-through">₹{p.basePrice.toLocaleString('en-IN')}</p>}
                    </td>
                    <td className="table-td">
                      <span className={`badge ${p.totalStock === 0 ? 'bg-red-100 text-red-700' : p.totalStock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {p.totalStock}
                      </span>
                    </td>
                    <td className="table-td">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${p.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <Link to={`/products/${p._id}/edit`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">Edit</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-12 text-gray-400">No products found</div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => { const ps = new URLSearchParams(searchParams); ps.set('page', p); setSearchParams(ps) }}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
