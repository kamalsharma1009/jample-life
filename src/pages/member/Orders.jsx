import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, Search, Filter, ChevronRight, ShoppingBag,
  Clock, CheckCircle2, ArrowUpRight, Calendar, ExternalLink, Loader2
} from 'lucide-react'
import { getOrders } from '@/services/dbService'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge'

export default function OrdersPage() {
  const { profile } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getOrders(profile?.id)
        setOrders(data)
      } catch (err) {
        console.warn('[OrdersPage] Failed to load orders:', err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile?.id])

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.order_number.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'ALL' || o.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order History &amp; Volume Credits
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your product deliveries, invoices, and personal BV/PV allocations
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-jample-burgundy text-white font-bold text-xs hover:bg-jample-burgundy/90 transition shadow-sm self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          Shop More Products
        </Link>
      </div>

      {/* ─────────────────────────────────────────────
          FILTERS & SEARCH
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PROCESSING', 'DELIVERED', 'SHIPPED', 'CONFIRMED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          ORDERS LIST
      ───────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-jample-burgundy" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No orders found</h3>
          <p className="text-xs text-slate-500 mb-6">
            You haven&apos;t placed any orders matching the current filter.
          </p>
          <Link
            to="/shop"
            className="px-5 py-2.5 bg-jample-burgundy text-white rounded-xl text-xs font-bold hover:bg-jample-burgundy/90 transition inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore Store
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900">
                        {order.order_number}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <span className="text-xs text-slate-400">
                      Placed on {formatDate(order.created_at)} &bull; Payment via {order.payment_method}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">{formatCurrency(order.total_amount)}</div>
                    <div className="text-[11px] font-bold text-emerald-600">
                      +{order.total_bv} BV ({order.total_pv} PV)
                    </div>
                  </div>
                  <Link
                    to={`/orders/${order.id}`}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    title="View Order Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Order items preview */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.product_name_snapshot}</h4>
                        <div className="text-[11px] text-slate-500">
                          Qty: {item.quantity} &bull; {formatCurrency(item.unit_price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
