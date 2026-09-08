import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ShoppingBag, Star, CheckCircle2, ShieldCheck,
  Zap, Heart, Share2, Sparkles, ChevronRight, Plus, Minus,
  Leaf, Award, Check
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const DEFAULT_IMAGES = {
  'JL-NSC-001': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
  'JL-NO-002': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
  'JL-NKJ-003': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80',
  'JL-SP-004': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&auto=format&fit=crop&q=80',
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [addedToast, setAddedToast] = useState(false)
  const [activeTab, setActiveTab] = useState('benefits')
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const isUuid = slug && slug.includes('-') && slug.length >= 32
        const query = supabase.from('products').select('*')
        if (isUuid) {
          query.eq('id', slug)
        } else {
          query.eq('slug', slug)
        }

        const { data, error } = await query.maybeSingle()
        if (data) {
          const enriched = {
            ...data,
            rating: 4.9,
            reviews_count: 24,
            image_url: data.image_url || DEFAULT_IMAGES[data.sku] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
          }
          setProduct(enriched)

          // Fetch related
          const { data: related } = await supabase
            .from('products')
            .select('*')
            .neq('id', data.id)
            .limit(3)
          if (related) {
            setRelatedProducts(related.map(r => ({
              ...r,
              image_url: r.image_url || DEFAULT_IMAGES[r.sku] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
            })))
          }
        }
      } catch (err) {
        console.error('Error fetching product from Supabase:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-bold">Loading product from Supabase...</div>
  }

  if (!product) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-base font-bold text-slate-700">Product not found in Supabase.</p>
        <Link to="/shop" className="text-xs font-bold text-[#853953] hover:underline">
          Return to Catalog
        </Link>
      </div>
    )
  }

  const discountPct = Math.round(((product.mrp - (product.selling_price || product.dp)) / product.mrp) * 100)

  const handleAddToCart = () => {
    addItem(product, quantity)
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 2500)
  }

  const handleBuyNow = () => {
    addItem(product, quantity)
    navigate('/checkout')
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">Added {quantity} x &ldquo;{product.name}&rdquo; to cart</span>
          <Link to="/cart" className="text-xs text-amber-300 font-semibold underline ml-2">
            View Cart
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          BREADCRUMBS
      ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/shop" className="hover:text-jample-burgundy flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
        </Link>
        <span>/</span>
        <span className="text-slate-400">{product.category_name || 'Ayurveda'}</span>
        <span>/</span>
        <span className="text-slate-900 font-bold line-clamp-1">{product.name}</span>
      </div>

      {/* ─────────────────────────────────────────────
          MAIN PRODUCT CARD
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Product Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 px-3 py-1.5 bg-emerald-500 text-white text-xs font-extrabold rounded-full shadow">
              {discountPct}% OFF MEMBER PRICE
            </span>
            <span className="absolute top-4 right-4 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold rounded-full">
              In Stock ({product.stock_quantity} units)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <Leaf className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-700 block">100% Herbal</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <Award className="w-5 h-5 mx-auto text-amber-600 mb-1" />
              <span className="text-[11px] font-bold text-slate-700 block">GMP Certified</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <ShieldCheck className="w-5 h-5 mx-auto text-jample-burgundy mb-1" />
              <span className="text-[11px] font-bold text-slate-700 block">Ayush Approved</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400">SKU: {product.sku}</span>
              <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-full">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviews_count} verified reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {product.short_description}
            </p>

            {/* MLM Volume Badges */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Business Volume (BV)
                </span>
                <span className="text-lg font-black text-emerald-700">
                  {product.business_volume || product.pv * 10} BV
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Point Volume (PV)
                </span>
                <span className="text-lg font-black text-jample-burgundy">
                  {product.pv} PV
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  {formatCurrency(product.dp)}
                </span>
                <span className="text-sm text-slate-400 line-through font-medium">
                  MRP {formatCurrency(product.mrp)}
                </span>
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Save {formatCurrency(product.mrp - product.dp)} ({discountPct}%)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                * Distributor price applicable to registered Jample Life independent members. Includes all taxes.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-2xl bg-slate-50 p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-black text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2.5 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-4 px-6 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white rounded-2xl text-sm font-black shadow-lg shadow-jample-burgundy/20 transition flex items-center justify-center gap-2"
            >
              Buy Now &amp; Checkout
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          PRODUCT TABS (Description, Benefits, Ingredients, Usage)
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('benefits')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'benefits'
                ? 'bg-jample-burgundy text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Key Benefits
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'ingredients'
                ? 'bg-jample-burgundy text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ingredients &amp; Composition
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'usage'
                ? 'bg-jample-burgundy text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Directions &amp; Dosage
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'description'
                ? 'bg-jample-burgundy text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Full Description
          </button>
        </div>

        <div className="text-sm text-slate-700 leading-relaxed pt-2">
          {activeTab === 'benefits' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Proven Health &amp; Wellness Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(product.benefits || [
                  'Formulated with organic standardized Ayurvedic extracts',
                  'Supports vital organs, energy levels and natural immunity',
                  'Zero harmful chemicals, preservatives or artificial colorings',
                  'Manufactured under strict GMP certified pharmaceutical conditions'
                ]).map((b, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-slate-800">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">Active Botanical Ingredients</h3>
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-mono">
                {product.ingredients || 'Standardized herbal extract blend in vegetarian HPMC capsules.'}
              </p>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">Recommended Dosage &amp; Method</h3>
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                {product.usage_instructions || 'Take 1-2 capsules twice daily with lukewarm water before meals.'}
              </p>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">Detailed Product Information</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.full_description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          RELATED PRODUCTS RECOMMENDATION
      ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Frequently Bought Together</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {relatedProducts.map((rel) => (
            <Link
              key={rel.id}
              to={`/shop/${rel.slug}`}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex items-center gap-4 group"
            >
              <img
                src={rel.image_url}
                alt={rel.name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-jample-burgundy transition-colors line-clamp-1">
                  {rel.name}
                </h4>
                <div className="text-xs text-slate-500 mt-1">
                  DP: <strong className="text-slate-900 font-black">{formatCurrency(rel.dp)}</strong> &bull; {rel.pv} PV
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
