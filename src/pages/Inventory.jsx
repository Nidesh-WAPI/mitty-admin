import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Inventory() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editSizes, setEditSizes] = useState([])
  const [saving, setSaving] = useState(false)

  const lowStock = searchParams.get('lowStock') === 'true'
  const page = Number(searchParams.get('page') || 1)

  const fetchProducts = () => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (lowStock) params.lowStock = 'true'
    api.get('/admin/inventory', { params })
      .then(({ data }) => { setProducts(data.products); setPagination(data.pagination) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [page, lowStock])

  const startEdit = (product) => {
    setEditingProduct(product)
    setEditSizes(product.sizes.map(s => ({ ...s })))
  }

  const handleSaveStock = async () => {
    setSaving(true)
    try {
      await api.put(`/products/${editingProduct._id}/stock`, { sizes: editSizes })
      toast.success('Stock updated')
      setEditingProduct(null)
      fetchProducts()
    } catch {
      toast.error('Failed to update stock')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} products</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => { const p = new URLSearchParams(); setSearchParams(p) }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!lowStock ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >All Products</button>
        <button
          onClick={() => setSearchParams({ lowStock: 'true' })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${lowStock ? 'bg-red-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >⚠️ Low Stock Only</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? <LoadingSpinner size="lg" className="py-16" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Product</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Total Stock</th>
                  <th className="table-th">Sizes</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || 'https://placehold.co/40x40'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="font-medium text-gray-900 max-w-[160px] truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="table-td text-gray-500">{p.category?.name}</td>
                    <td className="table-td">
                      <span className={`badge font-semibold ${p.totalStock === 0 ? 'bg-red-100 text-red-700' : p.totalStock <= p.lowStockThreshold ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {p.totalStock === 0 ? '⚠ Out of Stock' : `${p.totalStock} units`}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex flex-wrap gap-1">
                        {p.sizes?.length > 0
                        ? p.sizes.map(s => (
                          <span key={s.size} className={`text-xs px-1.5 py-0.5 rounded border ${s.stock <= 0 ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-gray-600'}`}>
                            {s.size}: {s.stock}
                          </span>
                        ))
                        : <span className="text-xs text-gray-500">{p.totalStock} units (no options)</span>
                      }
                      </div>
                    </td>
                    <td className="table-td">
                      <button onClick={() => startEdit(p)} className="text-primary-600 hover:text-primary-700 text-sm font-medium">Update Stock</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <div className="text-center py-12 text-gray-400">No products found</div>}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1">{editingProduct.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Update stock for each option</p>
            <div className="space-y-3">
              {editSizes.map((s, i) => (
                <div key={s.size} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 w-36 truncate">{s.size}</span>
                  <input
                    type="number" min="0"
                    value={s.stock}
                    onChange={(e) => { const u = [...editSizes]; u[i].stock = Number(e.target.value); setEditSizes(u) }}
                    className="input w-32 text-center"
                  />
                  <span className="text-xs text-gray-400 w-16 text-right">units</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveStock} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save Stock'}
              </button>
              <button onClick={() => setEditingProduct(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
