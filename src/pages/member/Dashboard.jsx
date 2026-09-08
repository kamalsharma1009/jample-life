import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet, TrendingUp, Users, ShoppingBag, Award, ArrowUpRight,
  Copy, Check, Share2, AlertCircle, ArrowRight, ShieldCheck,
  ChevronRight, Zap, Target, Clock, Star, BarChart3, Activity,
  QrCode, ExternalLink, MessageCircle, Sparkles, Building2,
  CheckCircle2, RefreshCw
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency, formatNumber, getRankDisplay } from '@/lib/utils'
import { getNotices, getWalletTransactions, getOrders } from '@/services/dbService'
import { toast } from 'sonner'

// ── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ title, value, sub, icon: Icon, trend, accent = false, badgeText }) {
  return (
    <div className={`relative bg-white rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg ${
      accent ? 'border-[#853953]/30 shadow-md ring-1 ring-[#853953]/10' : 'border-slate-200/80 shadow-sm hover:border-slate-300'
    }`}>
      <div className="flex items-center justify-between mb-3.5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
          accent ? 'bg-[#853953] text-white shadow-sm' : 'bg-slate-100 text-slate-700'
        }`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <ArrowUpRight size={13} />
            +{trend}%
          </span>
        )}
        {badgeText && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
            {badgeText}
          </span>
        )}
      </div>
      <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight tabular-num">{value}</p>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{title}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Professional Action Tile ────────────────────────────────────────────────
function ActionTile({ to, icon: Icon, title, description, badge }) {
  return (
    <Link
      to={to}
      className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-[#853953]/30 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-[#853953] group-hover:text-white text-slate-700 flex items-center justify-center transition-colors">
            <Icon size={20} />
          </div>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#853953]/10 text-[#853953] uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#853953] transition-colors flex items-center gap-1">
          {title}
          <ChevronRight size={14} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </h4>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}

export default function MemberDashboard() {
  const { user, profile } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [notices, setNotices] = useState([])
  const [liveTransactions, setLiveTransactions] = useState([])

  useEffect(() => {
    getNotices(true).then(setNotices).catch(() => setNotices([]))

    const memberId = profile?.id || user?.id
    Promise.allSettled([
      getWalletTransactions(memberId),
      getOrders(memberId)
    ]).then(([txRes, ordRes]) => {
      const txs = txRes.status === 'fulfilled' ? txRes.value : []
      const ords = ordRes.status === 'fulfilled' ? ordRes.value : []

      const combined = []
      txs.forEach(t => {
        const isCred = !t.transaction_type?.includes('DEBIT') && !t.transaction_type?.includes('PAYMENT')
        combined.push({
          type: t.transaction_type?.toLowerCase().includes('commission') ? 'commission' : 'payout',
          title: t.description || t.transaction_type?.replace(/_/g, ' '),
          date: t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
          amount: `${isCred ? '+' : '-'}${formatCurrency(t.amount)}`,
          status: t.status || 'Completed',
          positive: isCred,
          rawDate: new Date(t.created_at || Date.now())
        })
      })

      ords.forEach(o => {
        combined.push({
          type: 'order',
          title: `Order #${o.order_number}`,
          date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
          amount: `-${formatCurrency(o.total_amount)}`,
          status: o.status || 'Delivered',
          positive: false,
          rawDate: new Date(o.created_at || Date.now())
        })
      })

      combined.sort((a, b) => b.rawDate - a.rawDate)
      if (combined.length > 0) {
        setLiveTransactions(combined.slice(0, 5))
      }
    }).catch(err => console.warn('Could not load member dashboard transactions:', err))
  }, [profile?.id, user?.id])

  const memberId     = profile?.member_id    || ''
  const memberName   = profile?.full_name    || 'Distributor'
  const referralCode = profile?.referral_code || memberId
  const referralUrl  = `${window.location.origin}/register?ref=${referralCode}`
  const kycStatus    = profile?.kyc_status   || 'PENDING'

  const walletBalance    = profile?.wallet_balance    ?? 0
  const totalEarned      = profile?.total_earned      ?? 0
  const personalPv       = profile?.personal_pv       ?? 0
  const personalBv       = profile?.personal_bv       ?? 0
  const teamBv           = profile?.team_bv           ?? 0
  const directReferrals  = profile?.direct_referrals_count  ?? 0
  const totalDownline    = profile?.total_downline_count    ?? 0

  const pvTarget    = 25
  const pvProgress  = Math.min(100, Math.round((personalPv / pvTarget) * 100))
  const isQualified = personalPv >= pvTarget

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    toast.success('Referral link copied to clipboard!')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hello! Join my team at Jample Life — Rich World Healthy World. Register using my distributor referral code ${referralCode}: ${referralUrl}`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  // Chart data
  const earningsData = [
    { week: 'W1', earned: 2100, commission: 1450 },
    { week: 'W2', earned: 3800, commission: 2600 },
    { week: 'W3', earned: 2900, commission: 1950 },
    { week: 'W4', earned: 5200, commission: 3700 },
    { week: 'W5', earned: 4100, commission: 2900 },
    { week: 'W6', earned: 6800, commission: 4800 },
    { week: 'W7', earned: 5500, commission: 3800 },
    { week: 'W8', earned: 7200, commission: 5200 },
  ]

  const teamLevels = [
    { level: 'Level 1 (Direct)', members: directReferrals, rate: '10%', bv: 1200, color: 'bg-[#853953]', barColor: '#853953' },
    { level: 'Level 2 (Downline)', members: 18, rate: '8%',  bv: 3200, color: 'bg-emerald-600', barColor: '#059669' },
    { level: 'Level 3 (Downline)', members: 24, rate: '6%',  bv: 2650, color: 'bg-amber-600', barColor: '#d97706' },
    { level: 'Level 4 to 13', members: totalDownline - directReferrals - 18 - 24, rate: '1-4%', bv: 1400, color: 'bg-blue-600', barColor: '#2563eb' },
  ]

  const recentTransactions = liveTransactions.length > 0 ? liveTransactions : [
    { type: 'commission', title: '13-Level Weekly Commission Credited', date: 'Cycle #SET-W09', amount: '+₹3,450.00', status: 'Credited', positive: true },
    { type: 'order', title: 'Ayurvedic Personal Purchase', date: 'Delivered', amount: '-₹1,250.00', status: 'Delivered', positive: false },
    { type: 'team', title: 'New Distributor Enrolled in Level 2', date: 'Downline Active', amount: '+150 BV', status: 'BV Added', positive: true },
    { type: 'payout', title: 'Weekly Bank Settlement Payout Processed', date: 'Settled to Bank', amount: '+₹8,200.00', status: 'Settled', positive: true },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* ── TOP HERO BANNER: DISTRIBUTOR COMMAND CENTER ── */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0f172a] p-6 lg:p-8 text-white shadow-xl border border-white/10">
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#853953] rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#10b981] rounded-full blur-3xl opacity-15" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </div>

        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Left: Identity, Badges & Status */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-white/10 border border-white/15 rounded-lg text-xs font-mono text-amber-300 font-bold flex items-center gap-1.5">
                <Building2 size={12} />
                ID: {memberId}
              </span>
              {personalPv >= pvTarget ? (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck size={13} />
                  Cycle Qualified ({personalPv} PV)
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <Clock size={13} />
                  Qualification Pending ({personalPv}/{pvTarget} PV)
                </span>
              )}
              <span className="px-3 py-1 bg-[#853953]/50 border border-[#853953] rounded-lg text-xs font-bold text-rose-200">
                {getRankDisplay(profile?.rank_code)?.name || 'MEMBER'}
              </span>
              <span className="px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-medium text-slate-300">
                Cycle: W09-2026 • Closes Mon 23:59 IST
              </span>
            </div>

            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Distributor Command Center
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Welcome, <strong className="text-amber-300 font-bold">{memberName}</strong>. Your network is active across 13 commission levels. Maintain 25 PV each cycle to maximize weekly bonus pools.
              </p>
            </div>

            {/* PV Progress Tracker */}
            <div className="max-w-md bg-white/[0.06] border border-white/10 rounded-xl p-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Personal Volume Qualification</span>
                <span className={`font-bold ${personalPv >= pvTarget ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {personalPv} / {pvTarget} PV ({Math.min(100, Math.round((personalPv / pvTarget) * 100))}%)
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (personalPv / pvTarget) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                {personalPv >= pvTarget ? (
                  <>
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    Qualified for full 13-Level Unilevel & Leadership Bonus payouts this cycle.
                  </>
                ) : (
                  <>
                    <Clock size={11} className="text-amber-400" />
                    Purchase products worth {pvTarget - personalPv} more PV to activate weekly commissions.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right: Quick Wallet Overview Card */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-2xl p-5 min-w-[280px] shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Balance</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready for Payout
                </span>
              </div>
              <p className="text-3xl lg:text-4xl font-black text-white tabular-num mt-2 tracking-tight">
                {formatCurrency(walletBalance)}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1 pt-2 border-t border-white/10">
                <span>Pending Weekly Commission:</span>
                <span className="font-bold text-amber-300 tabular-num">₹5,200.00</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Link
                to="/payout"
                className="flex-1 py-2.5 px-3 bg-[#853953] hover:bg-[#9e4363] text-white text-xs font-bold rounded-xl transition-all shadow-md text-center flex items-center justify-center gap-1.5"
              >
                <Wallet size={14} />
                Withdraw Now
              </Link>
              <Link
                to="/wallet"
                className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold rounded-xl transition-all text-center"
              >
                Ledger
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 KEY PERFORMANCE METRICS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Lifetime Earnings"
          value={formatCurrency(totalEarned)}
          sub="All 13-level payouts credited"
          icon={TrendingUp}
          trend={18.4}
        />
        <MetricCard
          title="This Week's Commission"
          value="₹5,200.00"
          sub="Estimated settlement on Monday"
          icon={Zap}
          accent={true}
          badgeText="Pending Settlement"
        />
        <MetricCard
          title="Team Business Volume"
          value={`${formatNumber(teamBv)} BV`}
          sub={`Personal: ${personalBv} BV | Team: ${teamBv - personalBv} BV`}
          icon={BarChart3}
          trend={12.6}
        />
        <MetricCard
          title="Total Downline Network"
          value={`${totalDownline} Members`}
          sub={`${directReferrals} Direct (L1) • ${totalDownline - directReferrals} Indirect (L2-L13)`}
          icon={Users}
          trend={8.2}
        />
      </div>

      {/* ── OPERATIONAL ACTION TILES (Classic, High-End Corporate Style) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Actions & Management</h3>
          <span className="text-xs text-slate-500">MLM Operations</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionTile
            to="/shop"
            icon={ShoppingBag}
            title="Product Repurchase"
            description="Browse 100% Ayurvedic products to maintain monthly PV and earn retail margin."
            badge="Personal PV"
          />
          <ActionTile
            to="/referral"
            icon={Share2}
            title="Sponsor New Member"
            description="Generate branded invite links and expand direct downline in your 13-level tree."
            badge="10% L1 Bonus"
          />
          <ActionTile
            to="/team"
            icon={Users}
            title="Genealogy Network"
            description="Inspect your visual tree hierarchy, downline ranks, and team BV volumes."
            badge="48 Downline"
          />
          <ActionTile
            to="/payout"
            icon={Wallet}
            title="Bank Settlement"
            description="Submit direct NEFT/IMPS withdrawal requests with automatic TDS compliance."
            badge="Fast Payout"
          />
        </div>
      </div>

      {/* ── TWO-COLUMN DETAILED ANALYTICS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT COLUMN: CHARTS & TRANSACTIONS (2 Cols) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Weekly Commission Performance Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Weekly Earnings Performance</h3>
                <p className="text-xs text-slate-500">Historical trend across last 8 weekly settlement cycles</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-[#853953]" />
                  Total Payout
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-3 h-1.5 rounded-full bg-[#612D53]" />
                  Level Bonus
                </div>
                <Link to="/income" className="text-xs font-bold text-[#853953] hover:underline flex items-center gap-0.5 ml-2">
                  Statements <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
                  <defs>
                    <linearGradient id="memberEarnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#853953" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#853953" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                    formatter={(val, name) => [formatCurrency(val), name === 'earned' ? 'Total Payout' : 'Level Bonus']}
                  />
                  <Area type="monotone" dataKey="earned" stroke="#853953" strokeWidth={2.5} fill="url(#memberEarnGrad)" dot={{ r: 3, fill: '#853953' }} />
                  <Area type="monotone" dataKey="commission" stroke="#612D53" strokeWidth={2} strokeDasharray="4 3" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Financial & Network Transactions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Transactions & Team Events</h3>
                <p className="text-xs text-slate-400">Live ledger credits and downline activities</p>
              </div>
              <Link to="/wallet" className="text-xs font-bold text-[#853953] hover:underline flex items-center gap-1">
                Full Ledger <ChevronRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      tx.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {tx.type === 'commission' && <TrendingUp size={16} />}
                      {tx.type === 'order' && <ShoppingBag size={16} />}
                      {tx.type === 'team' && <Users size={16} />}
                      {tx.type === 'payout' && <Wallet size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{tx.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-extrabold tabular-num ${tx.positive ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {tx.amount}
                    </p>
                    <span className="text-[11px] font-semibold text-slate-400">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: REFERRALS, 13-LEVEL STATS & NOTICES (1 Col) */}
        <div className="space-y-6">

          {/* Professional Referral Hub Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#853953]/10 text-[#853953] flex items-center justify-center">
                  <Share2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Distributor Referral Hub</h3>
                  <p className="text-[11px] text-slate-400">Share your direct sponsor link</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(!showQrModal)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="View QR Code"
              >
                <QrCode size={16} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl mb-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Sponsor Code</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-extrabold text-slate-900 tracking-wider">{referralCode}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Active Direct Link
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                readOnly
                value={referralUrl}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 font-mono truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#853953] hover:bg-[#9e4363] text-white shadow-sm'
                }`}
              >
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={handleWhatsAppShare}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageCircle size={14} />
                WhatsApp
              </button>
              <Link
                to="/referral"
                className="py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                Referral Center
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* QR Code preview box */}
            {showQrModal && (
              <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50 text-center animate-in fade-in duration-200">
                <p className="text-xs font-bold text-slate-800 mb-2">Scan to Register Under {memberId}</p>
                <div className="w-32 h-32 mx-auto bg-white border border-slate-300 rounded-lg flex items-center justify-center shadow-xs">
                  <QrCode size={100} className="text-slate-800" />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-mono">{referralUrl}</p>
              </div>
            )}
          </div>

          {/* 13-Level Team Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">13-Level Network Volume</h3>
                <p className="text-[11px] text-slate-400">Distribution of downline members & BV</p>
              </div>
              <Link to="/team" className="text-xs font-bold text-[#853953] hover:underline">
                View Tree
              </Link>
            </div>

            <div className="space-y-3.5">
              {teamLevels.map((lvl, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${lvl.color}`} />
                      {lvl.level}
                    </span>
                    <span className="font-mono font-bold text-[#853953]">{lvl.rate} Commission</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(10, Math.min(100, (lvl.members / totalDownline) * 100))}%`,
                        backgroundColor: lvl.barColor
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{lvl.members} Active Members</span>
                    <span className="font-bold text-slate-700">{lvl.bv.toLocaleString()} BV</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Company Notices */}
          {notices && notices.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Corporate Bulletins</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Official</span>
              </div>
              <div className="space-y-3">
                {notices.slice(0, 2).map((notice, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{notice.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {notice.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
