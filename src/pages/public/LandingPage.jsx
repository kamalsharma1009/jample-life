import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ShieldCheck, Sparkles, TrendingUp, Users, Award,
  CheckCircle2, ShoppingBag, Zap, Star, ChevronRight, Leaf,
  DollarSign, Globe, Heart
} from 'lucide-react'
import { getProducts } from '@/services/dbService'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/stores/cartStore'

const COMMISSION_LEVELS = [
  { level: 'Level 1', rate: '10%', color: '#853953' },
  { level: 'Level 2', rate: '8%', color: '#9b4461' },
  { level: 'Level 3', rate: '6%', color: '#b05977' },
  { level: 'Level 4', rate: '4%', color: '#c46d8b' },
  { level: 'Level 5', rate: '4%', color: '#d882a0' },
  { level: 'Level 6', rate: '4%', color: '#e896b4' },
  { level: 'L7–L13', rate: '1–2%', color: '#f0abc8' },
]

const STATS = [
  { value: '13', label: 'Commission Levels' },
  { value: '₹48L+', label: 'Paid Out Monthly' },
  { value: '1,400+', label: 'Active Distributors' },
  { value: 'Weekly', label: 'Monday Settlements' },
]

const TESTIMONIALS = [
  { name: 'Kamal Verma', city: 'Gurugram', rank: 'Ruby Executive', income: '₹38,000/month', text: 'Within 8 months I built a 48-member team and crossed my previous salary. The weekly Monday settlement is the best part.' },
  { name: 'Priya Sharma', city: 'Jaipur', rank: 'Member', income: '₹12,000/month', text: 'The products genuinely work — my customers reorder every month. That made building trust in my network very easy.' },
  { name: 'Rahul Gupta', city: 'Pune', rank: 'Diamond Director', income: '₹1.2L/month', text: 'No gimmicks, no hidden cuts. The commission structure is published openly and pays exactly as promised.' },
]

export default function LandingPage() {
  const { addItem } = useCartStore()
  const [addedToast, setAddedToast] = useState(null)
  const [products, setProducts] = useState([])

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error)
  }, [])

  const featured = products?.filter(p => p.featured) || []
  const featuredProducts = featured.length > 0 ? featured : (products?.slice(0, 4) || [])

  const handleAddToCart = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
    setAddedToast(product.name)
    setTimeout(() => setAddedToast(null), 2500)
  }

  return (
    <div className="bg-white overflow-hidden">

      {/* ── Toast ──────────────────────────────────────────── */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 animate-slide-up">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">Added "{addedToast}" to cart</span>
          <Link to="/cart" className="text-xs text-amber-300 font-bold hover:underline ml-2">View Cart</Link>
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative bg-[#0f172a] text-white overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#853953] rounded-full blur-[120px] opacity-20 -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#612D53] rounded-full blur-[100px] opacity-15 translate-y-1/3 -translate-x-1/3" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f172a]/50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 lg:pt-28 lg:pb-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/12 text-amber-300 text-xs font-semibold">
                <Sparkles size={13} className="text-amber-400" />
                Direct Selling · Rich World Healthy World
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Premium Health Products.{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)' }}>
                  Real Income.
                </span>
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                Jample Life combines 100% Ayurvedic wellness products with a transparent 13-level direct selling system. Join 1,400+ distributors earning weekly, on time — every Monday.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm rounded-xl transition-all shadow-gold hover:-translate-y-0.5"
                >
                  Join as Distributor
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/18 text-white font-semibold text-sm rounded-xl border border-white/15 transition-colors"
                >
                  <ShoppingBag size={16} />
                  Explore Products
                </Link>
              </div>

              {/* Trust bar */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                {[
                  { icon: ShieldCheck, label: 'GMP Certified', color: 'text-emerald-400' },
                  { icon: Leaf, label: '100% Ayurvedic', color: 'text-green-400' },
                  { icon: DollarSign, label: 'Weekly Payouts', color: 'text-amber-400' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={15} className={color} />
                    <span className="text-xs font-semibold text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Featured product card */}
            {featuredProducts[0] && (
              <div className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-amber-400 text-slate-900 text-xs font-bold rounded-full">
                    Featured Product
                  </span>
                  <span className="text-xs text-slate-400">Up to 50% member discount</span>
                </div>

                <div className="aspect-video rounded-xl overflow-hidden bg-white/5">
                  <img
                    src={featuredProducts[0].image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'}
                    alt={featuredProducts[0].name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const fallback = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback
                      }
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{featuredProducts[0].name}</h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{featuredProducts[0].short_description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-slate-500 line-through">MRP: {formatCurrency(featuredProducts[0].mrp)}</p>
                    <p className="text-2xl font-bold text-amber-300 tabular-num">DP: {formatCurrency(featuredProducts[0].dp)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Business Volume</p>
                    <p className="text-sm font-bold text-emerald-300">{featuredProducts[0].business_volume} BV ({featuredProducts[0].pv} PV)</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link to={`/shop/${featuredProducts[0].slug}`} className="flex-1 py-2.5 text-center text-sm font-semibold text-white bg-white/10 hover:bg-white/18 rounded-xl transition-colors border border-white/12">
                    View Details
                  </Link>
                  <button
                    onClick={e => handleAddToCart(featuredProducts[0], e)}
                    className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors"
                  >
                    <ShoppingBag size={15} />
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/8 bg-white/4 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/8">
              {STATS.map(stat => (
                <div key={stat.label} className="py-6 px-6 text-center">
                  <p className="text-2xl font-bold text-amber-300 tabular-num">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITION ───────────────────────────────── */}
      <section className="py-20 bg-gray-50/80 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#853953] uppercase tracking-widest bg-[#853953]/8 px-3 py-1.5 rounded-full">
              Why Jample Life
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              A Business Model Built for Longevity
            </h2>
            <p className="text-gray-500 mt-3 text-base leading-relaxed">
              Unlike ordinary MLM companies, Jample Life couples tangible, GMP-certified Ayurvedic wellness products with a transparent, rule-compliant commission ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: '13-Level Deep Income', desc: 'Earn 10% on L1 down to 1% on L13 as your team expands.', color: 'text-[#853953]', bg: 'bg-rose-50' },
              { icon: ShieldCheck, title: '100% Pure Ayurveda', desc: 'Noni, Seabuckthorn, Curcumin, Ashwagandha — GMP certified.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: TrendingUp, title: 'Weekly Monday Payouts', desc: 'Settlement every Monday. Bank credit by Tuesday morning.', color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: Users, title: 'Transparent Network', desc: 'Live genealogy tree. Real-time BV and commission tracking.', color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map(item => (
              <div key={item.title} className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center ${item.color} mb-5`}>
                  <item.icon size={22} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ──────────────────────────────────────────── */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-[#853953] uppercase tracking-widest">Our Products</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Ayurvedic Wellness Collection
              </h2>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#853953] hover:underline">
              View all products <ChevronRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <div key={product.id} className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const fallback = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback
                      }
                    }}
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{product.category_name}</p>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight mt-0.5 line-clamp-2">{product.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className={i < Math.floor(product.rating || 4.8) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">{product.reviews_count} reviews</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400 line-through">MRP: {formatCurrency(product.mrp)}</p>
                      <p className="text-lg font-bold text-[#853953] tabular-num">DP: {formatCurrency(product.dp)}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{product.pv} PV</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Link
                      to={`/shop/${product.slug}`}
                      className="flex-1 py-2 text-center text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={e => handleAddToCart(product, e)}
                      className="flex-1 py-2 text-xs font-bold text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                      style={{ background: 'linear-gradient(135deg, #853953, #612D53)' }}
                    >
                      <ShoppingBag size={12} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMISSION PLAN ───────────────────────────────────── */}
      <section id="opportunity" className="py-20 bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full">
              Compensation Plan
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              13-Level Commission Architecture
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Earn from your entire downline — up to 13 generations deep. All commissions auto-calculated every Monday and credited to your wallet.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Level table */}
            <div className="space-y-2">
              {COMMISSION_LEVELS.map((l, i) => (
                <div key={l.level} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ backgroundColor: l.color }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{l.level}</p>
                    <div className="h-1.5 mt-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${parseFloat(l.rate) * 10}%`,
                          backgroundColor: l.color,
                          maxWidth: '100%',
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-lg font-bold tabular-num" style={{ color: l.color }}>{l.rate}</span>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="space-y-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-white">How Earnings Work</h3>
                {[
                  { q: 'Minimum qualification', a: '25 PV personal repurchase per weekly cycle' },
                  { q: 'Settlement day', a: 'Every Monday at 23:59 IST' },
                  { q: 'Payout availability', a: 'Tuesday morning — IMPS/NEFT direct to bank' },
                  { q: 'BDC Pool bonus', a: '5% of global BV split among qualified members' },
                  { q: 'Director Bonus Pool', a: '20% of global BV for Director rank & above' },
                  { q: 'TDS deduction', a: '5% (Section 194H) — reported to Income Tax' },
                ].map(item => (
                  <div key={item.q} className="flex gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{item.q}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/register"
                className="flex items-center justify-center gap-2 w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm rounded-xl transition-colors shadow-gold"
              >
                Start Earning Today
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#853953] uppercase tracking-widest">Real Members</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Stories from Our Network
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-jample-gradient flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.city} · {t.rank}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm font-bold text-emerald-600">{t.income}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-500 text-lg">
            Join 1,400+ distributors across India building health and wealth with Jample Life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-sm shadow-jample hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #853953, #612D53)' }}
            >
              Register as Distributor
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-gray-700 text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Already a member? Sign in
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
