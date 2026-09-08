import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import LoadingScreen from '@/components/shared/LoadingScreen'

/**
 * ProtectedRoute — requires authentication.
 * Redirects to /login if not logged in.
 * Both ADMIN and MEMBER can pass through (layout handles separation).
 */
export default function ProtectedRoute() {
  const { user, profile, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <LoadingScreen />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Admin users trying to access member routes → redirect to admin
  if (profile?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  // Blocked or suspended members get a restricted view
  if (profile?.status === 'BLOCKED' || profile?.status === 'SUSPENDED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Restricted</h2>
          <p className="text-gray-600 mb-1">
            Your account has been {profile.status.toLowerCase()}.
          </p>
          <p className="text-sm text-gray-500">
            Please contact support for assistance.
          </p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
