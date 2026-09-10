import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, GitBranch, Layers,
  ShoppingBag, Tag, Package, BarChart3,
  TrendingUp, Settings2, Award, GraduationCap,
  Wallet, Receipt, CreditCard, ShieldCheck,
  FileCheck, CheckSquare, Megaphone, Bell,
  BarChart2, Settings, FileText, ChevronRight,
  ChevronLeft, ChevronDown, X, LogOut, Activity
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
    ],
  },
  {
    label: 'Network',
    items: [
      { label: 'Members',   icon: Users,      to: '/admin/members' },
      { label: 'Networks',  icon: GitBranch,  to: '/admin/networks' },
      { label: 'Genealogy', icon: Layers,     to: '/admin/genealogy' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Products',   icon: ShoppingBag, to: '/admin/products' },
      { label: 'Categories', icon: Tag,         to: '/admin/categories' },
      { label: 'Orders',     icon: Package,     to: '/admin/orders' },
      { label: 'Inventory',  icon: BarChart3,   to: '/admin/inventory' },
    ],
  },
  {
    label: 'Business Engine',
    items: [
      { label: 'Business Volume',   icon: TrendingUp,    to: '/admin/business-volume' },
      { label: 'Commission Rules',  icon: Settings2,     to: '/admin/commission-rules' },
      { label: '13-Level Income',   icon: Layers,        to: '/admin/level-income' },
      { label: 'Plans',             icon: Receipt,       to: '/admin/plans' },
      { label: 'BDC Pool',          icon: Award,         to: '/admin/bdc' },
      { label: 'Ranks & Titles',    icon: Award,         to: '/admin/ranks' },
      { label: 'Director Bonus',    icon: TrendingUp,    to: '/admin/director-bonus' },
      { label: 'Education',         icon: GraduationCap, to: '/admin/education' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Wallet Ledger',    icon: Wallet,      to: '/admin/wallet' },
      { label: 'Settlements',      icon: Receipt,     to: '/admin/settlements' },
      { label: 'Settlement Engine',icon: ShieldCheck, to: '/admin/settlements/control' },
      { label: 'Payouts',          icon: CreditCard,  to: '/admin/payouts' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { label: 'KYC Review',       icon: FileCheck,   to: '/admin/kyc' },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { label: 'Tasks',            icon: CheckSquare, to: '/admin/tasks' },
      { label: 'Notices',          icon: Megaphone,   to: '/admin/notices' },
      { label: 'Notifications',    icon: Bell,        to: '/admin/notifications' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Reports',          icon: BarChart2,   to: '/admin/reports' },
      { label: 'Settings',         icon: Settings,    to: '/admin/settings' },
      { label: 'Audit Logs',       icon: FileText,    to: '/admin/audit-logs' },
    ],
  },
]

export default function AdminSidebar({ collapsed, onCollapse, onClose }) {
  const { profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [collapsedGroups, setCollapsedGroups] = useState({})
  const [pendingKycCount, setPendingKycCount] = useState(0)

  useEffect(() => {
    async function fetchKyc() {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'MEMBER')
          .in('kyc_status', ['PENDING', 'SUBMITTED'])
        setPendingKycCount(data ? data.length : 0)
      } catch (err) {
        console.warn('[AdminSidebar] Error fetching pending KYC:', err)
      }
    }
    fetchKyc()

    const handleSync = () => fetchKyc()
    window.addEventListener('jample_kyc_updated', handleSync)

    const channel = supabase.channel('sidebar-kyc-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchKyc)
      .subscribe()

    return () => {
      window.removeEventListener('jample_kyc_updated', handleSync)
      supabase.removeChannel(channel)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
    toast.success('Signed out successfully')
  }

  const toggleGroup = (label) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <div className="h-full flex flex-col bg-[#0f172a] border-r border-white/[0.06] select-none">

      {/* ── Logo ────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/[0.06] flex-shrink-0">
        <div className={cn('flex items-center gap-3 min-w-0', collapsed && 'justify-center w-full')}>
          <div className="w-8 h-8 rounded-lg bg-jample-gradient flex items-center justify-center flex-shrink-0 shadow-jample">
            <span className="text-white font-black text-sm leading-none">JL</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-sm font-bold leading-tight">Jample Life</p>
              <span className="text-[10px] font-bold tracking-wider text-[#b05977] uppercase">Admin Panel</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onClose} className="xl:hidden p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
          <button onClick={onCollapse} className="hidden xl:flex p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>

      {/* ── Admin Identity ──────────────────────────────── */}
      {!collapsed && (
        <div className="mx-3 mt-4 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-jample-gradient flex items-center justify-center flex-shrink-0 shadow-jample text-white font-bold text-sm">
              {getInitials(profile?.full_name)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-slate-500 text-[11px]">Super Administrator</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-400 font-medium">All systems operational</span>
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
        {NAV_GROUPS.map((group) => {
          const isGroupCollapsed = collapsedGroups[group.label]
          return (
            <div key={group.label}>
              {!collapsed ? (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-3 mb-1 mt-4 first:mt-2"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                    {group.label}
                  </span>
                  <ChevronDown
                    size={12}
                    className={cn(
                      'text-slate-600 transition-transform duration-200',
                      isGroupCollapsed && '-rotate-90'
                    )}
                  />
                </button>
              ) : (
                <div className="h-px bg-white/[0.06] mx-2 my-2" />
              )}

              {!isGroupCollapsed && group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 w-full group',
                      collapsed ? 'justify-center px-0' : 'px-3',
                      isActive
                        ? 'bg-white/[0.10] text-white border-l-[3px] border-[#853953]'
                          + (collapsed ? '' : ' pl-[9px]')
                        : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 border-l-[3px] border-transparent'
                          + (collapsed ? '' : ' pl-[9px]')
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <div className="relative flex-shrink-0">
                        <item.icon
                          size={16}
                          className={cn(
                            'transition-colors',
                            isActive ? 'text-[#b05977]' : 'text-slate-500 group-hover:text-slate-300'
                          )}
                        />
                        {collapsed && item.to === '/admin/kyc' && pendingKycCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </div>
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="leading-none text-[13px]">{item.label}</span>
                          {item.to === '/admin/kyc' && pendingKycCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                              {pendingKycCount}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          )
        })}
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
