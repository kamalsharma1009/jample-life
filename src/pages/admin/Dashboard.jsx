import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, TrendingUp, ShoppingBag, Wallet, Award, ShieldCheck,
  ArrowUpRight, AlertCircle, CheckCircle2, Clock, Package,
  ChevronRight, Settings2, Play, RefreshCw, Layers, Activity
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { getMembers, getOrders } from '@/services/dbService'
import StatusBadge from '@/components/shared/StatusBadge'

function KpiCard({ title, value, sub, icon: Icon, iconBg, iconColor, trend, link }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-md hover:border-gray-300/60 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={19} className={iconColor} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            <ArrowUpRight size={11} className={trend < 0 ? 'rotate-90' : ''} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-num">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      {link && (
        <Link to={link.to} className="mt-3 text-xs font-semibold text-[#853953] hover:underline flex items-center gap-1">
          {link.label} <ChevronRight size={11} />
        </Link>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [members, setMembers] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    Promise.all([getMembers(), getOrders()])
      .then(([m, o]) => { setMembers(m); setOrders(o) })
      .catch(err => console.warn('[AdminDashboard] load failed:', err))
  }, [])

  const pendingKycCount = members.filter(m => m.kyc_status === 'PENDING').length
  const activeMembers   = members.filter(m => m.status === 'ACTIVE').length
  const pendingOrders   = orders.filter(o => o.status === 'PROCESSING').length

  // Live financial aggregates
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthlyRevenue = orders
    .filter(o => o.created_at?.startsWith(thisMonth))
    .reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const totalBv = orders.reduce((sum, o) => sum + (o.total_bv || 0), 0)

  const recentOrders = orders.slice(0, 5)

  // Build revenue chart data from live orders (last 7 months)
  const revenueData = (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const now = new Date()
    const result = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthOrders = orders.filter(o => o.created_at?.startsWith(key))
      const revenue = monthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      result.push({
        month: months[d.getMonth()],
        revenue,
        commission: revenue * 0.38,  // approx 38% payout rate
      })
    }
    return result
  })()

  // Build order status breakdown from live orders
  const orderStatusData = [
    { name: 'Processing', value: orders.filter(o => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length, color: '#f59e0b' },
    { name: 'Shipped',    value: orders.filter(o => o.status === 'SHIPPED').length,    color: '#3b82f6' },
    { name: 'Delivered',  value: orders.filter(o => o.status === 'DELIVERED').length,  color: '#10b981' },
    { name: 'Cancelled',  value: orders.filter(o => o.status === 'CANCELLED').length,  color: '#ef4444' },
  ]
  const totalOrdersCount = orders.length || 1  // avoid divide by zero

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto">

      {/* ── COMMAND BANNER ─────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0f172a] p-6 lg:p-8 text-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#853953] rounded-full blur-3xl opacity-20" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#612D53] rounded-full blur-3xl opacity-15" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-xs font-bold">Settlement Cycle: W09-2026 — OPEN</span>
              </div>
              <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold">
                Closes Monday 23:59 IST
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              MLM Operations Control Center
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Real-time platform monitoring · 13-level commission engine · Weekly settlements · Distributor network management
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/settlements/control"
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 text-sm font-bold rounded-xl transition-colors shadow-gold"
            >
              <Play size={16} />
              Run Settlement
            </Link>
            <Link
              to="/admin/members"
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/15 transition-colors"
            >
              <Users size={16} />
              Manage Members
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Monthly Turnover"
          value={formatCurrency(monthlyRevenue)}
          sub={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          link={{ to: '/admin/reports', label: 'View reports' }}
        />
        <KpiCard
          title="Active Distributors"
          value={`${activeMembers}`}
          sub={`${members.length} total members`}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={8.4}
          link={{ to: '/admin/members', label: 'Manage' }}
        />
        <KpiCard
          title="Total Business Volume"
          value={`${formatNumber(totalBv)} BV`}
          sub="All settlement periods"
          icon={Award}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          link={{ to: '/admin/business-volume', label: 'Details' }}
        />
        <KpiCard
          title="Orders This Month"
          value={orders.filter(o => o.created_at?.startsWith(thisMonth)).length}
          sub={`${pendingOrders} pending fulfillment`}
          icon={Wallet}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          link={{ to: '/admin/orders', label: 'View orders' }}
        />
      </div>

      {/* ── ALERT PILLS ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {pendingKycCount > 0 && (
          <Link
            to="/admin/kyc"
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
          >
            <AlertCircle size={15} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-800">{pendingKycCount} KYC documents pending review</span>
            <ChevronRight size={13} className="text-amber-500" />
          </Link>
        )}
        {pendingOrders > 0 && (
          <Link
            to="/admin/orders"
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Package size={15} className="text-blue-500" />
            <span className="text-xs font-semibold text-blue-800">{pendingOrders} orders need processing</span>
            <ChevronRight size={13} className="text-blue-500" />
          </Link>
        )}
        <Link
          to="/admin/settlements/control"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
        >
          <CheckCircle2 size={15} className="text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-800">Commission engine operational</span>
        </Link>
      </div>

      {/* ── CHARTS + TABLES ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Revenue + Commission Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200/80 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-bold text-gray-900">Revenue & Commission Payouts</p>
              <p className="text-xs text-gray-400">Monthly turnover vs total commissions disbursed</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#853953] rounded" /> <span className="text-gray-500">Revenue</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#612D53] rounded border-dashed" style={{borderTop: '2px dashed #612D53'}} /> <span className="text-gray-500">Commission</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#853953" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#853953" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="comGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#612D53" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#612D53" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Commission']}
              />
              <Area type="monotone" dataKey="revenue"    stroke="#853953" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              <Area type="monotone" dataKey="commission" stroke="#612D53" strokeWidth={2} fill="url(#comGrad)" dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-bold text-gray-900">Order Status</p>
              <p className="text-xs text-gray-400">Current cycle breakdown</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-[#853953] hover:underline">View all</Link>
          </div>

          {/* Visual bars */}
          <div className="space-y-3 mb-5">
            {orderStatusData.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-20 text-xs font-medium text-gray-600">{s.name}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((s.value / totalOrdersCount) * 100)}%`, backgroundColor: s.color }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-900 w-8 text-right tabular-num">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            <p className="text-xs text-gray-400">Total orders this cycle</p>
          </div>
        </div>
      </div>

      {/* ── PENDING KYC + RECENT ORDERS ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending KYC */}
        <div className="bg-white rounded-xl border border-gray-200/80">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-900">Pending KYC Reviews</p>
              <p className="text-xs text-gray-400">Requires admin verification</p>
            </div>
            <Link to="/admin/kyc" className="text-xs font-semibold text-[#853953] hover:underline">Review all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { name: 'Priya Sharma',    id: 'JL-2026-0089', submitted: '2 hours ago', type: 'PAN + Aadhaar' },
              { name: 'Rohit Agarwal',   id: 'JL-2026-0091', submitted: '5 hours ago', type: 'Bank Account' },
              { name: 'Sunita Verma',    id: 'JL-2026-0094', submitted: 'Yesterday',   type: 'Full KYC' },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
                  <p className="text-[11px] text-gray-400">{m.id} · {m.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400">{m.submitted}</p>
                  <Link
                    to="/admin/kyc"
                    className="text-[11px] font-bold text-[#853953] hover:underline"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200/80">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-900">Recent Orders</p>
              <p className="text-xs text-gray-400">Latest transactions</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-[#853953] hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs text-slate-400">No orders found.</div>
            ) : recentOrders.map((o, i) => {
              const statusColors = {
                DELIVERED:  'bg-emerald-50 text-emerald-700',
                SHIPPED:    'bg-blue-50 text-blue-700',
                PROCESSING: 'bg-amber-50 text-amber-700',
                CANCELLED:  'bg-red-50 text-red-700',
              }
              return (
                <div key={o.id || i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{o.order_number}</p>
                    <p className="text-[11px] text-gray-400">{o.profiles?.full_name || 'Member'}</p>
                  </div>
                  <div className="flex-1" />
                  <p className="text-sm font-bold text-gray-900 tabular-num">{formatCurrency(o.total_amount)}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>
                    {o.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── COMMISSION ENGINE STATUS ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Settings2 size={18} className="text-[#853953]" />
            <div>
              <p className="text-sm font-bold text-gray-900">Commission Engine Status</p>
              <p className="text-xs text-gray-400">13-level MLM calculation engine — Settlement Cycle W09-2026</p>
            </div>
          </div>
          <Link to="/admin/commission-rules" className="text-xs font-semibold text-[#853953] hover:underline flex items-center gap-1">
            Configure rules <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { level: 'L1', rate: '10%', pool: '₹45,000',  qualified: 348 },
            { level: 'L2', rate: '8%',  pool: '₹36,000',  qualified: 260 },
            { level: 'L3', rate: '6%',  pool: '₹27,000',  qualified: 186 },
            { level: 'L4', rate: '4%',  pool: '₹18,000',  qualified: 124 },
            { level: 'L5', rate: '4%',  pool: '₹18,000',  qualified: 82 },
            { level: 'L6', rate: '4%',  pool: '₹18,000',  qualified: 45 },
            { level: 'L7-13', rate: '1-2%', pool: '₹36,000', qualified: 12 },
          ].map((l) => (
            <div key={l.level} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
              <p className="text-xs font-bold text-[#853953]">{l.level}</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{l.rate}</p>
              <p className="text-[11px] text-gray-500 mt-1">{l.pool}</p>
              <p className="text-[10px] text-gray-400">{l.qualified} qual.</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
