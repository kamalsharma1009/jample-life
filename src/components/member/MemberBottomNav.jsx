import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, ShoppingBag, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const bottomNavItems = [
  { label: 'Home',    icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Network', icon: Users,           to: '/team' },
  { label: 'Shop',    icon: ShoppingBag,     to: '/shop' },
  { label: 'Income',  icon: TrendingUp,      to: '/income' },
  { label: 'Profile', icon: User,            to: '/profile' },
]

/**
 * Mobile-only bottom navigation bar.
 * Visible only on screens smaller than lg (1024px).
 */
export default function MemberBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {bottomNavItems.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-0',
                  isActive
                    ? 'text-jample-burgundy'
                    : 'text-gray-400 hover:text-gray-600'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    'p-1 rounded-lg transition-colors',
                    isActive && 'bg-pink-50'
                  )}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] font-medium truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
