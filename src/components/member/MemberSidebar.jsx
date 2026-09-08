import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Package,
  TrendingUp, Users, Share2, Wallet, CreditCard,
  Bell, CheckSquare, User, FileCheck, Settings,
  ChevronLeft, ChevronRight, X, LogOut, ChevronDown,
  Boxes, Activity
} from 'lucide-react'
import { cn, getRankDisplay, getInitials, formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard',   icon: LayoutDashboard, to: '/dashboard' },
      { label: 'Shop',        icon: ShoppingBag,     to: '/shop' },
      { label: 'My Orders',   icon: Package,         to: '/orders' },
      { label: 'Cart',        icon: ShoppingCart,    to: '/cart' },
    ],
  },
  {
    label: 'Business',
    items: [
      { label: 'My Income',   icon: TrendingUp, to: '/income' },
      { label: 'My Team',     icon: Users,      to: '/team' },
      { label: 'Referral',    icon: Share2,     to: '/referral' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Wallet',      icon: Wallet,     to: '/wallet' },
      { label: 'Payout',      icon: CreditCard, to: '/payout' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Notifications', icon: Bell,        to: '/notifications' },
      { label: 'Tasks & Goals', icon: CheckSquare,  to: '/tasks' },
      { label: 'KYC',           icon: FileCheck,   to: '/kyc' },
      { label: 'Profile',       icon: User,        to: '/profile' },
      { label: 'Settings',      icon: Settings,    to: '/settings' },
    ],
  },
]

const RANK_COLOR = {
  MEMBER:            'bg-slate-100 text-slate-600',
  RUBY_EXECUTIVE:    'bg-rose-100 text-rose-700',
  DIAMOND_DIRECTOR:  'bg-violet-100 text-violet-700',
  CROWN_AMBASSADOR:  'bg-amber-100 text-amber-700',
}

export default function MemberSidebar({ collapsed, onCollapse, onClose }) {
  const { profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const rankDisplay = getRankDisplay(profile?.rank_code)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnread = async () => {
    try {
      const readIds = JSON.parse(localStorage.getItem('jample_read_notifs') || '[]')
      const memberId = profile?.id

      const [ordersRes, txRes, payoutsRes, noticesRes] = await Promise.allSettled([
        memberId ? supabase.from('orders').select('id').eq('member_id', memberId) : Promise.resolve({ data: [] }),
        memberId ? supabase.from('wallet_transactions').select('id').eq('member_id', memberId) : Promise.resolve({ data: [] }),
        memberId ? supabase.from('payout_requests').select('id').eq('member_id', memberId) : Promise.resolve({ data: [] }),
        supabase.from('notices').select('id').eq('status', 'PUBLISHED')
      ])

      const notifIds = []
      if (ordersRes.value?.data) ordersRes.value.data.forEach(o => notifIds.push(`ord-${o.id}`))
      if (txRes.value?.data) txRes.value.data.forEach(t => notifIds.push(`tx-${t.id}`))
      if (payoutsRes.value?.data) payoutsRes.value.data.forEach(p => notifIds.push(`pay-${p.id}`))
      if (noticesRes.value?.data) noticesRes.value.data.forEach(n => notifIds.push(`not-${n.id}`))

      const count = notifIds.filter(id => !readIds.includes(id)).length
      setUnreadCount(count)
    } catch (e) {
      console.warn(e)
    }
  }

  useEffect(() => {
    fetchUnread()

    const channel = supabase.channel('member-sidebar-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, fetchUnread)
      .subscribe()

    const onRead = () => fetchUnread()
    window.addEventListener('storage', onRead)
    window.addEventListener('jample_notifications_read', onRead)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('storage', onRead)
      window.removeEventListener('jample_notifications_read', onRead)
    }
  }, [profile?.id])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
    toast.success('Signed out successfully')
  }

  const walletBalance = profile?.wallet_balance ?? 0

  return (
    <div className="h-full flex flex-col bg-[#0f172a] border-r border-white/[0.06] select-none">

      {/* ── Logo / Header ──────────────────────────────── */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/[0.06] flex-shrink-0">
        <div className={cn('flex items-center gap-3 min-w-0', collapsed && 'justify-center w-full')}>
          <div className="w-8 h-8 rounded-lg bg-jample-gradient flex items-center justify-center flex-shrink-0 shadow-jample">
            <span className="text-white font-black text-sm leading-none">JL</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-sm font-bold leading-tight">Jample Life</p>
              <p className="text-slate-500 text-[10px] leading-tight">Rich World Healthy World</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
          <button onClick={onCollapse} className="hidden lg:flex p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>

      {/* ── Member Identity Card ────────────────────────── */}
      {!collapsed && profile && (
        <div className="mx-3 mt-4 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-jample-gradient flex items-center justify-center flex-shrink-0 shadow-jample text-white font-bold text-sm">
              {getInitials(profile.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate leading-tight">{profile.full_name}</p>
              <p className="text-slate-500 text-[11px] font-mono mt-0.5">{profile.member_id || ''}</p>
            </div>
          </div>
          {/* Rank badge */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', RANK_COLOR[profile.rank_code] || RANK_COLOR.MEMBER)}>
              {rankDisplay?.name || 'MEMBER'}
            </span>
            <span className="text-slate-400 text-[11px] font-semibold">
              Wallet: <span className="text-amber-400 font-bold">{formatCurrency(walletBalance)}</span>
            </span>
          </div>
        </div>
      )}

      {/* ── Collapsed Avatar ────────────────────────────── */}
      {collapsed && profile && (
        <div className="flex justify-center mt-4">
          <div className="w-9 h-9 rounded-xl bg-jample-gradient flex items-center justify-center text-white font-bold text-sm">
            {getInitials(profile.full_name)}
          </div>
        </div>
      )}

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 px-3 mb-1 mt-4 first:mt-2">
                {group.label}
              </p>
            )}
            {collapsed && <div className="h-px bg-white/[0.06] mx-2 my-2" />}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 w-full group',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-white/[0.10] text-white border-l-[3px] border-[#853953] pl-[9px]'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 border-l-[3px] border-transparent pl-[9px]'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <div className="relative flex-shrink-0">
                      <item.icon
                        size={17}
                        className={cn(
                          'transition-colors',
                          isActive ? 'text-[#b05977]' : 'text-slate-500 group-hover:text-slate-300'
                        )}
                      />
                      {collapsed && item.to === '/notifications' && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                    {!collapsed && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="leading-none">{item.label}</span>
                        {item.to === '/notifications' && unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                            {unreadCount}
                          </span>
                        )}
                        {item.to === '/kyc' && profile?.kyc_status && (
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                            profile.kyc_status === 'VERIFIED'
                              ? "bg-emerald-500/20 text-emerald-400"
                              : profile.kyc_status === 'REJECTED'
                              ? "bg-red-500/20 text-red-400"
                              : "bg-amber-500/20 text-amber-400"
                          )}>
                            {profile.kyc_status}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Sign Out ────────────────────────────────────── */}
      <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
        <button
          onClick={handleSignOut}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-500',
            'hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )
}
