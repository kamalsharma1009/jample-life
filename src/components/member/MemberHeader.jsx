import { Menu, Bell, Search, ChevronDown, Wallet, ShoppingCart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { getInitials, formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function MemberHeader({ onMenuClick }) {
  const { profile, signOut } = useAuthStore()
  const getItemCount = useCartStore(s => s.getItemCount)
  const totalItems = getItemCount()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getCycleCode = () => {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const pastDays = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000))
    const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7)
    return `W${String(weekNum).padStart(2, '0')}-${now.getFullYear()}`
  }
  const currentCycle = getCycleCode()

  const fetchUnreadCount = async () => {
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
      console.warn('[MemberHeader] Error loading notifications:', e)
    }
  }

  useEffect(() => {
    fetchUnreadCount()

    const channel = supabase.channel('member-header-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, fetchUnreadCount)
      .subscribe()

    const onNotificationRead = () => fetchUnreadCount()
    window.addEventListener('storage', onNotificationRead)
    window.addEventListener('jample_notifications_read', onNotificationRead)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('storage', onNotificationRead)
      window.removeEventListener('jample_notifications_read', onNotificationRead)
    }
  }, [profile?.id])

  const handleSignOut = async () => {
    setShowDropdown(false)
    await signOut()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0 shadow-xs">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb / Greeting */}
      <div className="hidden sm:flex items-center gap-2.5 leading-tight">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{greeting()},</span>
          <span className="text-sm font-extrabold text-slate-900">{profile?.full_name || 'Member'}</span>
        </div>
        {profile?.member_id && (
          <span className="hidden md:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 ml-1">
            {profile.member_id}
          </span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settlement Cycle Status Pill */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-slate-600 font-medium">Cycle <strong className="text-slate-800">{currentCycle}</strong></span>
        <span className="text-slate-400 font-normal">• Closes Mon</span>
      </div>

      {/* Wallet Balance pill */}
      <Link
        to="/wallet"
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-colors shadow-2xs"
      >
        <div className="w-5 h-5 rounded-md bg-[#853953]/10 text-[#853953] flex items-center justify-center">
          <Wallet size={12} />
        </div>
        <div className="flex flex-col text-left leading-none">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Wallet</span>
          <span className="text-xs font-black text-slate-900 tabular-num">
            {formatCurrency(profile?.wallet_balance ?? 0)}
          </span>
        </div>
      </Link>

      {/* Cart */}
      <Link
        to="/cart"
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <ShoppingCart size={20} />
        {totalItems > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#853953] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </Link>

      {/* Notifications */}
      <Link
        to="/notifications"
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      {/* Avatar + Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-jample-gradient flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">{getInitials(profile?.full_name)}</span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-gray-900 leading-tight">{profile?.full_name?.split(' ')[0]}</p>
            <p className="text-[10px] text-gray-400 leading-tight font-mono">{profile?.member_id || ''}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden md:block" />
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-dropdown z-20 py-1.5 overflow-hidden animate-fade-in">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900">{profile?.full_name}</p>
                <p className="text-[11px] text-gray-400">{profile?.email}</p>
              </div>
              {[
                { label: 'My Profile', to: '/profile' },
                { label: 'KYC Documents', to: '/kyc' },
                { label: 'Settings', to: '/settings' },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
