import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Package, Plus, Search, Filter, Sparkles, CheckCircle2,
  ChevronRight, X, Edit3, Image, AlertCircle, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { getProducts, getCategories, createProduct } from '@/services/dbService'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [prods, cats] = await Promise.all([
        getProducts(),
        getCategories(),
      ])
      setProducts(prods)
      setCategories(cats)
    } catch (err) {
      console.error('Error loading Supabase products:', err)
      toast.error('Failed to load products from Supabase: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const onCreateProduct = async (data) => {
    setIsSubmitting(true)
    try {
      const mrp = parseFloat(data.mrp) || 0
      const dp = parseFloat(data.dp) || 0
      const pv = parseInt(data.pv) || 25
      const bv = parseInt(data.business_volume) || pv * 10

      const created = await createProduct({
        sku: data.sku,
        name: data.name,
        mrp,
        dp,
        pv,
        business_volume: bv,
        stock_quantity: parseInt(data.stock_quantity) || 100,
      })

      setProducts([created, ...products])
      setIsModalOpen(false)
      reset()
      toast.success(`Product "${created.name}" saved directly to Supabase!`)
    } catch (err) {
      toast.error('Failed to save to Supabase: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat = selectedCategory === 'ALL' || p.category_name === selectedCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Product Catalog &amp; Volume Rules
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure retail MRP, distributor DP, Personal PV, and Business Volume (BV) rules
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-jample-burgundy text-white font-bold text-xs hover:bg-jample-burgundy/90 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* ─────────────────────────────────────────────
          CATALOG STATS
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Products</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{products.length} SKUs</div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active in Store</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {products.filter((p) => p.status === 'ACTIVE').length} Active
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Categories</span>
          <div className="text-2xl font-black text-purple-600 mt-1">{categories?.length || 0} Categories</div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Stock</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {products.reduce((acc, p) => acc + p.stock_quantity, 0)} Units
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          PRODUCT TABLE & FILTERS
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Wellness">Wellness</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Nutrition">Nutrition</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Product Info</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Retail MRP</th>
                <th className="py-3 px-4">Member DP</th>
                <th className="py-3 px-4">Personal PV</th>
                <th className="py-3 px-4">Business Vol (BV)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover"
                        onError={(e) => {
                          const fallback = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'
                          if (e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback
                          }
                        }}
                      />
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                        <span className="font-mono text-[11px] text-slate-400">SKU: {p.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {p.category_name}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-400 line-through">
                    {formatCurrency(p.mrp)}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    {formatCurrency(p.dp)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-jample-burgundy">
                    {p.pv} PV
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    {p.business_volume || p.pv * 10} BV
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {p.stock_quantity} units
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/admin/products/${p.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          ADD PRODUCT MODAL
      ───────────────────────────────────────────── */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add New Product</h3>
                <p className="text-xs text-slate-500">Configure product specifications, DP price, and volume points</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreateProduct)} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product SKU</label>
                  <input
                    type="text"
                    {...register('sku', { required: true })}
                    placeholder="e.g. JL-ALV-007"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    {...register('category_name')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy bg-white font-semibold"
                  >
                    <option value="Healthcare">Healthcare</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Nutrition">Nutrition</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  {...register('name', { required: true })}
                  placeholder="e.g. Pure Aloe Vera Juice"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Retail MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('mrp', { required: true })}
                    placeholder="2500"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Distributor DP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('dp', { required: true })}
                    placeholder="1250"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Point Vol (PV)</label>
                  <input
                    type="number"
                    {...register('pv')}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy font-bold text-jample-burgundy"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Vol (BV)</label>
                  <input
                    type="number"
                    {...register('business_volume')}
                    placeholder="250"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    {...register('stock_quantity')}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  {...register('image_url')}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows="2"
                  {...register('short_description')}
                  placeholder="Key herbal highlights..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
