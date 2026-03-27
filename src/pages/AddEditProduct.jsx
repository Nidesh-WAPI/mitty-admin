import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AddEditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState([])
  const [existingImages, setExistingImages] = useState([])

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', category: '',
    basePrice: '', discountedPrice: '', tags: '', isActive: true, isFeatured: false,
    lowStockThreshold: 5, metaTitle: '', metaDescription: '',
    stock: 0, // direct stock for products without options
  })
  // options = product variants with individual stock (e.g. Small, Medium, Large)
  const [options, setOptions] = useState([])
  const [hasOptions, setHasOptions] = useState(false)
  const [variants, setVariants] = useState([])
  const [newVariant, setNewVariant] = useState({ name: '', value: '' })

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories))
    if (isEdit) {
      api.get(`/products/${id}`).then(({ data }) => {
        const p = data.product
        setForm({
          name: p.name, description: p.description, shortDescription: p.shortDescription || '',
          category: p.category?._id || '', basePrice: p.basePrice, discountedPrice: p.discountedPrice || '',
          tags: p.tags?.join(', ') || '', isActive: p.isActive, isFeatured: p.isFeatured,
          lowStockThreshold: p.lowStockThreshold || 5, metaTitle: p.metaTitle || '',
          metaDescription: p.metaDescription || '', stock: p.stock || 0,
        })
        if (p.sizes && p.sizes.length > 0) {
          setHasOptions(true)
          setOptions(p.sizes.map(s => ({ ...s })))
        }
        setVariants(p.variants || [])
        setExistingImages(p.images || [])
      }).finally(() => setLoading(false))
    }
  }, [id])

  const handleAddOption = () => setOptions([...options, { size: '', stock: 0 }])
  const handleOptionChange = (i, field, value) => {
    const updated = [...options]
    updated[i][field] = field === 'stock' ? Number(value) : value
    setOptions(updated)
  }
  const handleRemoveOption = (i) => setOptions(options.filter((_, j) => j !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      // Send sizes (options) or empty array
      formData.append('sizes', JSON.stringify(hasOptions ? options.filter(o => o.size) : []))
      formData.append('variants', JSON.stringify(variants))
      if (isEdit) formData.append('existingImages', JSON.stringify(existingImages))
      images.forEach(img => formData.append('images', img))

      if (isEdit) {
        await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product updated')
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product created')
      }
      navigate('/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" className="py-20" />

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/products')} className="text-gray-500 hover:text-gray-700">←</button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. Terracotta Garden Pot" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description</label>
              <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="input" placeholder="Brief summary shown in product listings" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Description *</label>
              <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input resize-none" placeholder="Detailed product description — material, dimensions, care instructions..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" placeholder="terracotta, pot, garden, handmade" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price (₹) *</label>
              <input type="number" required min="0" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="input" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discounted Price (₹)</label>
              <input type="number" min="0" value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })} className="input" placeholder="Leave blank for no discount" />
            </div>
          </div>
        </div>

        {/* Stock */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Stock Management</h2>

          {/* Toggle: simple stock vs options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio" name="stockType" checked={!hasOptions}
                onChange={() => { setHasOptions(false); setOptions([]) }}
                className="accent-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">Single stock (no variants)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio" name="stockType" checked={hasOptions}
                onChange={() => setHasOptions(true)}
                className="accent-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">Multiple options (e.g. Small / Medium / Large)</span>
            </label>
          </div>

          {!hasOptions ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity *</label>
                <input
                  type="number" min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="input"
                  placeholder="Available units"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Low Stock Alert Threshold</label>
                <input type="number" min="1" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} className="input" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Add product options with individual stock counts (e.g. sizes by capacity, piece count, or dimensions).
              </p>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    value={opt.size}
                    onChange={(e) => handleOptionChange(i, 'size', e.target.value)}
                    className="input flex-1"
                    placeholder="Option label, e.g. Small (4 inch) or Set of 6"
                  />
                  <input
                    type="number" min="0"
                    value={opt.stock}
                    onChange={(e) => handleOptionChange(i, 'stock', e.target.value)}
                    className="input w-32"
                    placeholder="Stock"
                  />
                  <button type="button" onClick={() => handleRemoveOption(i)} className="text-red-500 hover:text-red-700 text-sm font-medium shrink-0">
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddOption} className="btn-outline text-sm">+ Add Option</button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 mt-2">Low Stock Alert Threshold</label>
                <input type="number" min="1" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} className="input w-32" />
              </div>
            </div>
          )}
        </div>

        {/* Attributes / Variants */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Product Attributes</h2>
          <p className="text-sm text-gray-500">Add descriptive attributes like Finish, Color, Material, or Dimensions.</p>
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={v.name} readOnly className="input bg-gray-50 w-36" />
              <input value={v.value} readOnly className="input bg-gray-50 flex-1" />
              <button type="button" onClick={() => setVariants(variants.filter((_, j) => j !== i))} className="text-red-500 text-sm font-medium">Remove</button>
            </div>
          ))}
          <div className="flex items-end gap-2 flex-wrap">
            <div className="w-36">
              <label className="block text-xs text-gray-500 mb-1">Attribute</label>
              <input value={newVariant.name} onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })} className="input" placeholder="e.g. Finish" />
            </div>
            <div className="flex-1 min-w-[8rem]">
              <label className="block text-xs text-gray-500 mb-1">Value</label>
              <input value={newVariant.value} onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })} className="input" placeholder="e.g. Matte Glaze" />
            </div>
            <button type="button" onClick={() => {
              if (newVariant.name && newVariant.value) {
                setVariants([...variants, newVariant])
                setNewVariant({ name: '', value: '' })
              }
            }} className="btn-outline">Add</button>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Images</h2>
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => setExistingImages(existingImages.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >✕</button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files))}
            className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          <p className="text-xs text-gray-400">Upload up to 10 images. Supported: JPEG, PNG, WebP. Max 5MB each.</p>
        </div>

        {/* Settings */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Settings</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-primary-600 w-4 h-4" />
              <span className="text-sm font-medium text-gray-700">Active (visible in store)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-primary-600 w-4 h-4" />
              <span className="text-sm font-medium text-gray-700">Featured on homepage</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><LoadingSpinner size="sm" /> Saving...</> : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
          <button type="button" onClick={() => navigate('/products')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}
