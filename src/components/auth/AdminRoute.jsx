import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import LoadingScreen from '@/components/shared/LoadingScreen'

/**
 * AdminRoute — requires ADMIN role.
 * Only users with role === 'ADMIN' can access admin routes.
 * Any other user (including MEMBER) is redirected to /dashboard.
 */
export default function AdminRoute() {
  const { user, profile, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <LoadingScreen />

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Not an admin → redirect to member dashboard
  // IMPORTANT: Never expose admin panel to non-admin users
  if (profile?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
