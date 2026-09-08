import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Package, CheckCircle2, Truck, CreditCard,
  MapPin, Printer, Sparkles, Save, ChevronRight, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getOrderById, updateOrderStatus } from '@/services/dbService'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('BLUEDART-98471928')

  useEffect(() => {
    getOrderById(id)
      .then(data => { setOrder(data); setSelectedStatus(data?.status || 'PROCESSING') })
      .catch(err => console.warn('[AdminOrderDetail] Failed to load:', err))
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdateStatus = async () => {
    if (!order) return
    try {
      const updated = await updateOrderStatus(order.id, selectedStatus)
      setOrder(updated)
      toast.success(`Order status updated to ${selectedStatus}!`)
    } catch (err) {
      toast.error('Failed to update order status: ' + err.message)
    }
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
        <Link to="/admin/orders" className="px-5 py-2.5 bg-jample-burgundy text-white rounded-xl text-xs font-bold hover:bg-jample-burgundy/90 transition inline-flex items-center gap-2 mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/admin/orders" className="hover:text-jample-burgundy flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> All Orders
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{order.order_number}</span>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-sm inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Invoice
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-1">
          <span className="font-mono text-xs font-bold text-slate-400">Order Ref: {order.order_number}</span>
          <h1 className="text-2xl font-black text-slate-900">Order Management &amp; Fulfillment</h1>
          <p className="text-xs text-slate-500">
            Placed on {formatDate(order.created_at)} by {order.profiles?.full_name || order.shipping_name} ({order.profiles?.mobile || order.shipping_phone || '—'})
          </p>
        </div>

        <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-700">Update Fulfillment Status</label>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold focus:outline-none"
            >
              <option value="PROCESSING">PROCESSING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <button
              onClick={handleUpdateStatus}
              className="px-4 py-2 bg-jample-burgundy text-white rounded-xl text-xs font-bold hover:bg-jample-burgundy/90 transition shadow-sm"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">Line Items &amp; Volume Contribution</h2>

          <div className="divide-y divide-slate-100">
            {(order.order_items || []).map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Package className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">SKU: {item.sku_snapshot}</span>
                    <h4 className="text-sm font-bold text-slate-900">{item.product_name_snapshot}</h4>
                    <span className="text-xs text-slate-500">Qty: {item.quantity} &times; {formatCurrency(item.unit_price)}</span>
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
              <span>Tax Amount</span>
              <span>{order.tax_amount > 0 ? formatCurrency(order.tax_amount) : 'FREE'}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-jample-burgundy" /> Shipping Destination
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">{order.shipping_name || order.profiles?.full_name}</p>
              <p>{order.shipping_phone || order.profiles?.mobile}</p>
              {order.shipping_address && <p>{order.shipping_address}</p>}
              <p>{[order.shipping_city, order.shipping_state].filter(Boolean).join(', ')} {order.shipping_pincode && `- ${order.shipping_pincode}`}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" /> Courier &amp; Logistics
            </h3>
            <div className="space-y-2 text-xs">
              <label className="block text-slate-600 font-medium">Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
