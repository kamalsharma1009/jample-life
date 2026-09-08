import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, Search, Filter, ChevronRight, CheckCircle2,
  Clock, Truck, XCircle, Download, Calendar, Loader2
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getOrders } from '@/services/dbService'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')

  useEffect(() => {
    getOrders().then(data => { setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filteredOrders = orders.filter((o) => {
    const memberName = o.profiles?.full_name || o.shipping_name || ''
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memberName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'ALL' || o.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Distributor Commerce Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor and fulfill orders placed across all distributor networks
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'PROCESSING', 'DELIVERED', 'SHIPPED'].map((st) => (
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

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">BV Generated</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={9} className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-jample-burgundy mx-auto" /></td></tr>
              ) : filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {ord.order_number}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {ord.profiles?.full_name || ord.shipping_name || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {formatDate(ord.created_at)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {ord.payment_method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {ord.order_items?.length || 0} items
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    +{ord.total_bv} BV
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    {formatCurrency(ord.total_amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={ord.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/admin/orders/${ord.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition inline-flex items-center gap-1"
                    >
                      Manage <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
