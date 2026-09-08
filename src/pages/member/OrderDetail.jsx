import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Package, CheckCircle2, Clock, Truck, ShieldCheck,
  Printer, Download, Sparkles, MapPin, CreditCard, ChevronRight, Loader2
} from 'lucide-react'
import { getOrderById } from '@/services/dbService'
import { formatCurrency, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getOrderById(id)
        setOrder(data)
      } catch (err) {
        console.warn('[OrderDetailPage] Failed to load order:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-jample-burgundy" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">Order not found</h3>
        <Link to="/orders" className="px-5 py-2.5 bg-jample-burgundy text-white rounded-xl text-xs font-bold hover:bg-jample-burgundy/90 transition inline-flex items-center gap-2 mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          BREADCRUMB & ACTIONS
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/orders" className="hover:text-jample-burgundy flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> All Orders
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{order.order_number}</span>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-sm self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Save Receipt
        </button>
      </div>

      {/* ─────────────────────────────────────────────
          ORDER HEADER CARD
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Order {order.order_number}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {formatDate(order.created_at)} &bull; Payment Method: {order.payment_method}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Amount</span>
            <span className="text-2xl font-black text-slate-900">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        {/* Volume Points Credited Badge */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Volume Credited on this Purchase:</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-black">
            <span className="text-emerald-700">+{order.total_bv} Business Volume (BV)</span>
            <span className="text-jample-burgundy">+{order.total_pv} Point Volume (PV)</span>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="py-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">Delivery Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: 'Order Placed', sub: 'Confirmed', done: true },
              { label: 'Payment Received', sub: `via ${order.payment_method}`, done: order.payment_status === 'PAID' },
              { label: 'Dispatched', sub: 'Bluedart Express', done: ['SHIPPED', 'DELIVERED'].includes(order.status) },
              { label: 'Delivered', sub: order.status === 'DELIVERED' ? 'Complete' : 'In Transit', done: order.status === 'DELIVERED' },
            ].map((step) => (
              <div key={step.label} className={`flex items-center gap-3 p-3 rounded-2xl border ${step.done ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                <CheckCircle2 className={`w-5 h-5 ${step.done ? 'text-emerald-600' : 'text-slate-400'} shrink-0`} />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{step.label}</span>
                  <span className="text-[10px] text-slate-500">{step.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          ITEMS LIST & ADDRESS
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">Ordered Products</h2>

          <div className="divide-y divide-slate-100">
            {(order.order_items || []).map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">SKU: {item.sku_snapshot}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.product_name_snapshot}</h4>
                    <span className="text-xs text-slate-500">
                      Qty: {item.quantity} &times; {formatCurrency(item.unit_price)} &bull; {item.bv_snapshot} BV ea
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 block">{formatCurrency(item.total)}</span>
                  <span className="text-xs font-bold text-emerald-600">+{item.bv_snapshot * item.quantity} BV</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Member DP)</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax</span>
              <span>{order.tax_amount > 0 ? formatCurrency(order.tax_amount) : <strong className="text-emerald-600">₹0</strong>}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Address Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-jample-burgundy" />
              Delivery Address
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">{order.shipping_name || order.profiles?.full_name}</p>
              <p>{order.shipping_phone || order.profiles?.mobile}</p>
              {order.shipping_address && <p>{order.shipping_address}</p>}
              <p>
                {[order.shipping_city, order.shipping_state].filter(Boolean).join(', ')}
                {order.shipping_pincode && ` - ${order.shipping_pincode}`}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Payment Summary
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Method: {order.payment_method}</p>
              <p className="text-emerald-600 font-bold">Status: {order.payment_status}</p>
              <p className="text-slate-400">Total: {formatCurrency(order.total_amount)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
