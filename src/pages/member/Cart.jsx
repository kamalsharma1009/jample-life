import { Link } from 'react-router-dom'
import {
  Trash2, ShoppingBag, Plus, Minus, ArrowRight, ArrowLeft,
  ShieldCheck, Sparkles, CheckCircle2, AlertCircle
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/utils'

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
    getSubtotal,
    getTotalMrp,
    getTotalSavings,
    getTotalBv,
    getTotalPv,
    getShippingCost,
    getTotalAmount,
  } = useCartStore()

  const itemCount = getItemCount()
  const subtotal = getSubtotal()
  const totalMrp = getTotalMrp()
  const totalSavings = getTotalSavings()
  const totalBv = getTotalBv()
  const totalPv = getTotalPv()
  const shippingCost = getShippingCost()
  const totalAmount = getTotalAmount()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-jample-burgundy mx-auto mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
          Explore our range of Ayurvedic health &amp; wellness products and start earning PV towards your distributor goals.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-jample-burgundy text-white font-bold text-sm hover:bg-jample-burgundy/90 transition shadow-lg shadow-jample-burgundy/20"
        >
          Explore Member Shop
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your items and verified distributor discounts before checkout
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Entire Cart
        </button>
      </div>

      {/* ─────────────────────────────────────────────
          CART CONTENT & SUMMARY GRID
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400">SKU: {item.sku}</span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">{formatCurrency(item.dp)}</span>
                      <span className="text-slate-400 line-through text-[11px]">{formatCurrency(item.mrp)}</span>
                      <span className="text-[11px] font-bold text-emerald-600">+{item.business_volume || item.pv * 10} BV</span>
                    </div>
                  </div>
                </div>

                {/* Quantity + Subtotal + Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-l-xl transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-r-xl transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <div className="text-sm font-black text-slate-900">
                      {formatCurrency(item.dp * item.quantity)}
                    </div>
                    <div className="text-[10px] font-bold text-jample-burgundy">
                      {(item.pv || 0) * item.quantity} PV Total
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold text-jample-burgundy hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Add more products from store
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900">Order Summary</h2>

          {/* Volume Credits Box */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-900">Total Business Volume (BV):</span>
              <strong className="text-amber-950 font-black text-sm">{totalBv} BV</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-900">Total Point Volume (PV):</span>
              <strong className="text-amber-950 font-black text-sm">{totalPv} PV</strong>
            </div>
            <p className="text-[11px] text-amber-800 leading-tight pt-1 border-t border-amber-200/60">
              * Volume points are credited to your member account immediately upon order placement.
            </p>
          </div>

          {/* Cost breakdown */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Total MRP (Retail Value)</span>
              <span className="line-through">{formatCurrency(totalMrp)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Distributor Savings</span>
              <span>-{formatCurrency(totalSavings)}</span>
            </div>
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Subtotal (Member DP)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Shipping &amp; Handling</span>
              <span>{shippingCost === 0 ? <strong className="text-emerald-600">FREE</strong> : formatCurrency(shippingCost)}</span>
            </div>
            {shippingCost > 0 && (
              <p className="text-[11px] text-slate-400">
                Add {formatCurrency(1000 - subtotal)} more for free delivery!
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex justify-between items-baseline mb-6">
              <span className="text-sm font-bold text-slate-900">Total Payable</span>
              <span className="text-2xl font-black text-slate-900">{formatCurrency(totalAmount)}</span>
            </div>

            <Link
              to="/checkout"
              className="w-full py-4 px-6 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white rounded-2xl text-sm font-black shadow-lg shadow-jample-burgundy/20 transition flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
