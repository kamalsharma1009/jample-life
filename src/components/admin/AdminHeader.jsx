import { Menu, Bell, Search, ChevronDown, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate, Link } from 'react-router-dom'
import { getInitials, cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminHeader({ onMenuClick }) {
  const { profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [pendingKycCount, setPendingKycCount] = useState(0)
  const [noticesCount, setNoticesCount] = useState(0)

  const handleSignOut = async () => {
    setShowDropdown(false)
    await signOut()
    navigate('/login')
  }

  const fetchLiveCounts = async () => {
    try {
      // 1. Live count of members with pending/submitted KYC
      const { data: kycData } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'MEMBER')
        .in('kyc_status', ['PENDING', 'SUBMITTED'])

      setPendingKycCount(kycData ? kycData.length : 0)

      // 2. Live count of published announcements/notices
      const { data: noticesData } = await supabase
        .from('notices')
        .select('id')
        .eq('status', 'PUBLISHED')

      setNoticesCount(noticesData ? noticesData.length : 0)
    } catch (err) {
      console.warn('[AdminHeader] Error fetching live counts:', err)
    }
  }

  useEffect(() => {
    fetchLiveCounts()

    // Real-time synchronization
    const channel = supabase.channel('admin-header-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchLiveCounts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, fetchLiveCounts)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const now = new Date()
  const isMonday = now.getDay() === 1
  const dayOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][now.getDay()]
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 xl:px-6 gap-4 flex-shrink-0">
      {/* Mobile toggle */}
      <button
        onClick={onMenuClick}
        className="xl:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Left info */}
      <div className="hidden md:flex flex-col">
        <span className="text-xs font-bold text-gray-900">Admin Control Center</span>
        <span className="text-[11px] text-gray-400">{dayOfWeek}, {dateStr}</span>
      </div>

      {/* Settlement warning pill */}
      {isMonday && (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={13} className="text-amber-500" />
          <span className="text-xs font-semibold text-amber-800">Settlement day — cycle closes tonight</span>
        </div>
      )}

      <div className="flex-1" />

      {/* Pending actions badge */}
      <Link
        to="/admin/kyc"
        className={cn(
          "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors",
          pendingKycCount > 0
            ? "bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800"
            : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700"
        )}
      >
        <span
          className={cn(
            "w-2 h-2 rounded-full flex-shrink-0",
            pendingKycCount > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
          )}
        />
        <span className="text-xs font-semibold">
          {pendingKycCount > 0 ? `${pendingKycCount} KYC Pending` : 'All KYC Clear'}
        </span>
      </Link>

      {/* Notifications */}
      <Link
        to="/admin/notices"
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        title="Broadcasts & Notices"
      >
        <Bell size={20} />
        {noticesCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#853953] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {noticesCount > 9 ? '9+' : noticesCount}
          </span>
        )}
      </Link>

      {/* Admin avatar dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-jample-gradient flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">{getInitials(profile?.full_name)}</span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-gray-900 leading-tight">{profile?.full_name?.split(' ')[0] || 'Admin'}</p>
            <p className="text-[10px] text-[#853953] font-bold leading-tight">Super Admin</p>
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
              <Link
                to="/admin/settings"
                onClick={() => setShowDropdown(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                System Settings
              </Link>
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
