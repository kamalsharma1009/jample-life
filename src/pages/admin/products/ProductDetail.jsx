import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft, Package, Sparkles, CheckCircle2, Save, Trash2,
  Image, Award, ShieldCheck, AlertCircle, RefreshCw, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { getProductById, updateProduct, PRODUCT_FALLBACK_METADATA } from '@/services/dbService'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    getProductById(id)
      .then(data => {
        if (data) {
          setProduct(data)
          const meta = PRODUCT_FALLBACK_METADATA[data.id] || {}
          reset({
            name: data.name,
            sku: data.sku,
            mrp: data.mrp,
            dp: data.dp || data.price,
            pv: data.pv,
            business_volume: data.business_volume || data.bv,
            stock_quantity: data.stock_quantity,
            status: data.status,
            short_description: data.short_description || meta.short_description,
            full_description: data.full_description || meta.full_description,
          })
        }
      })
      .catch(err => console.warn('[AdminProductDetail]', err))
      .finally(() => setLoading(false))
  }, [id, reset])

  const onUpdateProduct = async (data) => {
    if (!product) return
    try {
      const updated = await updateProduct(product.id, {
        name: data.name,
        mrp: parseFloat(data.mrp),
        dp: parseFloat(data.dp),
        price: parseFloat(data.dp),
        pv: parseInt(data.pv),
        business_volume: parseInt(data.business_volume),
        bv: parseInt(data.business_volume),
        stock_quantity: parseInt(data.stock_quantity),
        status: data.status,
        short_description: data.short_description,
        full_description: data.full_description,
      })
      setProduct(updated)
      toast.success('Product details and volume rules updated!')
    } catch (err) {
      toast.error('Failed to update product: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-jample-burgundy" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Product not found</h3>
        <Link to="/admin/products" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-jample-burgundy text-white rounded-xl text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          BREADCRUMBS & HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/admin/products" className="hover:text-jample-burgundy flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Product Catalog
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{product.name} ({product.sku})</span>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={product.status} />
          <Link
            to={`/shop/${product.slug}`}
            target="_blank"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            View in Store ↗
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          EDIT PRODUCT FORM
      ───────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onUpdateProduct)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: General & MLM Pricing */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Product Specifications &amp; Pricing</h2>
            <span className="font-mono text-xs text-slate-400">SKU: {product.sku}</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">SKU Code</label>
                <input
                  type="text"
                  {...register('sku')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy font-mono uppercase"
                />
              </div>
            </div>

            {/* MLM Volume & Pricing Grid */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Retail MRP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('mrp')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Distributor DP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('dp')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-black text-emerald-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Point Vol (PV)</label>
                <input
                  type="number"
                  {...register('pv')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-black text-jample-burgundy focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Vol (BV)</label>
                <input
                  type="number"
                  {...register('business_volume')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-black text-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Short Description</label>
              <textarea
                rows="2"
                {...register('short_description')}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Description</label>
              <textarea
                rows="4"
                {...register('full_description')}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ayurvedic Ingredients</label>
                <textarea
                  rows="3"
                  {...register('ingredients')}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Usage &amp; Dosage Instructions</label>
                <textarea
                  rows="3"
                  {...register('usage_instructions')}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Right: Media & Status Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Product Image Preview</h3>

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">Image URL</label>
              <input
                type="url"
                {...register('image_url')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Status &amp; Inventory</h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Publication Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-bold focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE (Visible in Store)</option>
                <option value="INACTIVE">INACTIVE (Hidden)</option>
                <option value="OUT_OF_STOCK">OUT OF STOCK</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Available Stock Units</label>
              <input
                type="number"
                {...register('stock_quantity')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
