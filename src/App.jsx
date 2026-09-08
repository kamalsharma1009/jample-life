import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

// Layouts
import PublicLayout from '@/layouts/PublicLayout'
import MemberLayout from '@/layouts/MemberLayout'
import AdminLayout from '@/layouts/AdminLayout'

// Guards
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminRoute from '@/components/auth/AdminRoute'

// Public pages
import LandingPage from '@/pages/public/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Member pages
import MemberDashboard from '@/pages/member/Dashboard'
import ShopPage from '@/pages/member/Shop'
import ProductDetailPage from '@/pages/member/ProductDetail'
import CartPage from '@/pages/member/Cart'
import CheckoutPage from '@/pages/member/Checkout'
import OrdersPage from '@/pages/member/Orders'
import OrderDetailPage from '@/pages/member/OrderDetail'
import IncomePage from '@/pages/member/Income'
import IncomeDetailPage from '@/pages/member/IncomeDetail'
import TeamPage from '@/pages/member/Team'
import ReferralPage from '@/pages/member/Referral'
import WalletPage from '@/pages/member/Wallet'
import PayoutPage from '@/pages/member/Payout'
import NotificationsPage from '@/pages/member/Notifications'
import TasksPage from '@/pages/member/Tasks'
import ProfilePage from '@/pages/member/Profile'
import KycPage from '@/pages/member/Kyc'
import SettingsPage from '@/pages/member/Settings'

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminMembers from '@/pages/admin/members/Members'
import AdminMemberDetail from '@/pages/admin/members/MemberDetail'
import AdminNetworks from '@/pages/admin/network/Networks'
import AdminNetworkDetail from '@/pages/admin/network/NetworkDetail'
import AdminGenealogy from '@/pages/admin/network/Genealogy'
import AdminProducts from '@/pages/admin/products/Products'
import AdminProductDetail from '@/pages/admin/products/ProductDetail'
import AdminCategories from '@/pages/admin/products/Categories'
import AdminInventory from '@/pages/admin/products/Inventory'
import AdminOrders from '@/pages/admin/orders/Orders'
import AdminOrderDetail from '@/pages/admin/orders/OrderDetail'
import AdminBusinessVolume from '@/pages/admin/business/BusinessVolume'
import AdminCommissionRules from '@/pages/admin/business/CommissionRules'
import AdminLevelIncome from '@/pages/admin/business/LevelIncome'
import AdminPlans from '@/pages/admin/business/Plans'
import AdminBdc from '@/pages/admin/business/Bdc'
import AdminRanks from '@/pages/admin/business/Ranks'
import AdminDirectorBonus from '@/pages/admin/business/DirectorBonus'
import AdminEducation from '@/pages/admin/business/Education'
import AdminWallet from '@/pages/admin/finance/Wallet'
import AdminSettlements from '@/pages/admin/finance/Settlements'
import AdminSettlementControl from '@/pages/admin/finance/SettlementControl'
import AdminSettlementDetail from '@/pages/admin/finance/SettlementDetail'
import AdminPayouts from '@/pages/admin/finance/Payouts'
import AdminKyc from '@/pages/admin/verification/Kyc'
import AdminTasks from '@/pages/admin/engagement/Tasks'
import AdminNotices from '@/pages/admin/engagement/Notices'
import AdminNotifications from '@/pages/admin/engagement/Notifications'
import AdminReports from '@/pages/admin/reports/Reports'
import AdminSettings from '@/pages/admin/system/Settings'
import AdminAuditLogs from '@/pages/admin/system/AuditLogs'

// Loading / Not Found
import LoadingScreen from '@/components/shared/LoadingScreen'
import NotFoundPage from '@/pages/NotFound'

function App() {
  const { initialize, isInitialized, setUser, refreshProfile } = useAuthStore()

  useEffect(() => {
    // Initialize auth state on mount
    initialize()

    // Listen for auth state changes (token refresh, sign out from another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          refreshProfile()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [initialize, setUser, refreshProfile])

  // Show loading screen until auth is initialized
  if (!isInitialized) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* ─────────────────────────────────────────────
          PUBLIC ROUTES (with header/footer)
      ───────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* ─────────────────────────────────────────────
          AUTH ROUTES (full-screen, no header)
      ───────────────────────────────────────────── */}
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/register"       element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />


      {/* ─────────────────────────────────────────────
          MEMBER ROUTES (requires login + MEMBER role)
      ───────────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MemberLayout />}>
          <Route path="/dashboard" element={<MemberDashboard />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/income/:id" element={<IncomeDetailPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/referral" element={<ReferralPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/payout" element={<PayoutPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/kyc" element={<KycPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* ─────────────────────────────────────────────
          ADMIN ROUTES (requires login + ADMIN role)
      ───────────────────────────────────────────── */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/members" element={<AdminMembers />} />
          <Route path="/admin/members/:id" element={<AdminMemberDetail />} />
          <Route path="/admin/networks" element={<AdminNetworks />} />
          <Route path="/admin/networks/:id" element={<AdminNetworkDetail />} />
          <Route path="/admin/genealogy" element={<AdminGenealogy />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/:id" element={<AdminProductDetail />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/business-volume" element={<AdminBusinessVolume />} />
          <Route path="/admin/commission-rules" element={<AdminCommissionRules />} />
          <Route path="/admin/level-income" element={<AdminLevelIncome />} />
          <Route path="/admin/plans" element={<AdminPlans />} />
          <Route path="/admin/bdc" element={<AdminBdc />} />
          <Route path="/admin/ranks" element={<AdminRanks />} />
          <Route path="/admin/director-bonus" element={<AdminDirectorBonus />} />
          <Route path="/admin/education" element={<AdminEducation />} />
          <Route path="/admin/wallet" element={<AdminWallet />} />
          <Route path="/admin/settlements" element={<AdminSettlements />} />
          <Route path="/admin/settlements/control" element={<AdminSettlementControl />} />
          <Route path="/admin/settlements/:id" element={<AdminSettlementDetail />} />
          <Route path="/admin/payouts" element={<AdminPayouts />} />
          <Route path="/admin/kyc" element={<AdminKyc />} />
          <Route path="/admin/tasks" element={<AdminTasks />} />
          <Route path="/admin/notices" element={<AdminNotices />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        </Route>
      </Route>

      {/* Redirect /app → /dashboard */}
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
