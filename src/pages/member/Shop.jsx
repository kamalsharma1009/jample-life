import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Filter, ShoppingBag, Star, CheckCircle2, ArrowRight,
  Sparkles, Layers, SlidersHorizontal, ChevronRight, Plus, Minus
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency, cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const DEFAULT_IMAGES = {
  'JL-NSC-001': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
  'JL-NO-002': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
  'JL-NKJ-003': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80',
  'JL-SP-004': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&auto=format&fit=crop&q=80',
}

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [addedToast, setAddedToast] = useState(null)
  const [quantities, setQuantities] = useState({})

  const { addItem, getItemCount, getSubtotal } = useCartStore()
  const cartItemCount = getItemCount()
  const cartSubtotal = getSubtotal()

  // Fetch real products from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [prodRes, catRes] = await Promise.all([
          supabase.from('products').select('*').eq('status', 'ACTIVE'),
          supabase.from('product_categories').select('*').eq('status', 'ACTIVE'),
        ])

        if (prodRes.data) {
          const enriched = prodRes.data.map((p) => ({
            ...p,
            rating: 4.9,
            reviews_count: 24,
            image_url: p.image_url || DEFAULT_IMAGES[p.sku] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
          }))
          setProducts(enriched)
        }

        if (catRes.data) {
          setCategories(catRes.data)
        }
      } catch (err) {
        console.error('Error fetching Supabase products:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleQuantityChange = (productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1
      const next = Math.max(1, current + delta)
      return { ...prev, [productId]: next }
    })
  }

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1
    addItem(product, qty)
    setAddedToast(product.name)
    setTimeout(() => setAddedToast(null), 2500)
  }

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCat =
          selectedCategory === 'all' ||
          p.category_slug === selectedCategory ||
          p.category_id === selectedCategory ||
          (selectedCategory === 'healthcare' && p.category_id === 'cat-1') ||
          (selectedCategory === 'wellness' && p.category_id === 'cat-2') ||
          (selectedCategory === 'personal-care' && p.category_id === 'cat-3') ||
          (selectedCategory === 'nutrition' && p.category_id === 'cat-4')

        return matchesSearch && matchesCat
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.dp - b.dp
        if (sortBy === 'price-high') return b.dp - a.dp
        if (sortBy === 'pv-high') return b.pv - a.pv
        if (sortBy === 'bv-high') return b.business_volume - a.business_volume
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      })
  }, [products, searchQuery, selectedCategory, sortBy])

  return (
    <div className="space-y-8 pb-20">
      {/* Toast notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">Added &ldquo;{addedToast}&rdquo; to cart</span>
          <Link to="/cart" className="text-xs text-amber-300 font-semibold underline ml-2">
            View Cart
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          PAGE HEADER BANNER
      ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-jample-dark via-jample-purple to-jample-burgundy rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Special Member Distributor Pricing (DP)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Jample Life Product Store
          </h1>
          <p className="text-sm text-slate-200 max-w-xl">
            Order genuine Ayurvedic health &amp; wellness products at 50% discount. Every order contributes directly to your Personal PV and team commission volume.
          </p>
        </div>

        {/* Mini cart pill */}
        {cartItemCount > 0 && (
          <Link
            to="/cart"
            className="shrink-0 bg-amber-400 hover:bg-amber-300 text-slate-950 px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-lg transition"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-950 text-white text-[10px] font-black flex items-center justify-center">
                {cartItemCount}
              </span>
            </div>
            <span>Cart: {formatCurrency(cartSubtotal)}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* ─────────────────────────────────────────────
          FILTERS & SEARCH BAR
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or herbal ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy text-sm bg-slate-50 focus:bg-white transition"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
            >
              <option value="featured">Featured &amp; Recommended</option>
              <option value="pv-high">Highest PV (Point Volume)</option>
              <option value="bv-high">Highest BV (Business Volume)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition',
              selectedCategory === 'all'
                ? 'bg-jample-burgundy text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            All Products ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => setSelectedCategory(cat.slug || cat.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition',
                selectedCategory === (cat.slug || cat.id)
                  ? 'bg-jample-burgundy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          PRODUCT GRID
      ───────────────────────────────────────────── */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No products found</h3>
          <p className="text-xs text-slate-500 mb-6">
            Try adjusting your search keywords or clearing the category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
            className="px-5 py-2.5 bg-jample-burgundy text-white rounded-xl text-xs font-bold hover:bg-jample-burgundy/90 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const qty = quantities[product.id] || 1
            const discountPct = Math.round(((product.mrp - product.dp) / product.mrp) * 100)

            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Product image with badges */}
                <div className="relative aspect-square bg-slate-50 overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.featured && (
                      <span className="px-2.5 py-1 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider shadow">
                        Featured
                      </span>
                    )}
                    <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-full">
                      {product.category_name || 'Ayurveda'}
                    </span>
                  </div>

                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white text-[11px] font-extrabold rounded-full shadow">
                    {discountPct}% OFF
                  </span>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span className="font-mono text-[11px]">SKU: {product.sku}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    <Link to={`/shop/${product.slug}`}>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-jample-burgundy transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {product.short_description}
                    </p>
                  </div>

                  {/* Volume Points & Pricing */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl">
                      <div className="text-xs">
                        <span className="text-slate-500">Business Volume: </span>
                        <strong className="text-emerald-700 font-bold">{product.business_volume || product.pv * 10} BV</strong>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500">PV: </span>
                        <strong className="text-jample-burgundy font-bold">{product.pv} PV</strong>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-xs text-slate-400 line-through">MRP: {formatCurrency(product.mrp)}</div>
                        <div className="text-xl font-black text-slate-900">DP: {formatCurrency(product.dp)}</div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        Save {formatCurrency(product.mrp - product.dp)}
                      </span>
                    </div>

                    {/* Quantity & Add to Cart */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                        <button
                          onClick={() => handleQuantityChange(product.id, -1)}
                          className="p-2 hover:bg-slate-200 text-slate-600 rounded-l-xl transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(product.id, 1)}
                          className="p-2 hover:bg-slate-200 text-slate-600 rounded-r-xl transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 py-2.5 px-4 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar (if items in cart) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 inset-x-4 max-w-2xl mx-auto z-40 bg-slate-950/95 backdrop-blur-xl text-white p-4 rounded-3xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              {cartItemCount}
            </div>
            <div>
              <div className="text-xs text-slate-400">Total in Cart</div>
              <div className="text-base font-black text-amber-300">{formatCurrency(cartSubtotal)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition"
            >
              View Cart
            </Link>
            <Link
              to="/checkout"
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow"
            >
              Checkout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
