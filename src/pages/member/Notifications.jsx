import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Bell, CheckCheck, Trash2, DollarSign, ShoppingBag, 
  Users, AlertCircle, Award, Sparkles, ChevronRight, Filter, Loader2
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getOrders, getWalletTransactions, getPayoutRequests, getNotices } from '@/services/dbService'
import { formatDate } from '@/lib/utils'

export default function Notifications() {
  const { user, profile } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('ALL') // ALL, COMMISSION, ORDERS, TEAM, SYSTEM
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jample_read_notifs') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    async function loadNotifications() {
      setIsLoading(true)
      try {
        const memberId = profile?.id || user?.id

        const [ordersRes, txRes, payoutsRes, noticesRes] = await Promise.allSettled([
          memberId ? getOrders(memberId) : getOrders(),
          memberId ? getWalletTransactions(memberId) : getWalletTransactions(),
          memberId ? getPayoutRequests(memberId) : getPayoutRequests(),
          getNotices()
        ])

        const orders = ordersRes.status === 'fulfilled' ? ordersRes.value : []
        const transactions = txRes.status === 'fulfilled' ? txRes.value : []
        const payouts = payoutsRes.status === 'fulfilled' ? payoutsRes.value : []
        const notices = noticesRes.status === 'fulfilled' ? noticesRes.value : []

        const aggregated = []

        // Orders notifications
        orders.slice(0, 10).forEach(order => {
          aggregated.push({
            id: `ord-${order.id}`,
            category: 'ORDERS',
            title: `Order #${order.order_number} (${order.status})`,
            message: `Your order for ₹${Number(order.total_amount).toLocaleString('en-IN')} has status: ${order.status}.`,
            rawDate: new Date(order.created_at || Date.now()),
            timestamp: formatDate(order.created_at, 'datetime'),
            link: `/orders/${order.id}`,
            linkText: 'Track Order'
          })
        })

        // Wallet / Commission transactions
        transactions.slice(0, 10).forEach(tx => {
          const isComm = tx.transaction_type?.includes('COMMISSION') || tx.transaction_type?.includes('BONUS')
          aggregated.push({
            id: `tx-${tx.id}`,
            category: isComm ? 'COMMISSION' : 'SYSTEM',
            title: tx.transaction_type?.replace(/_/g, ' ') || 'Wallet Transaction',
            message: `${tx.description || `Transaction of ₹${Number(tx.amount).toLocaleString('en-IN')}`}. Balance: ₹${Number(tx.balance_after || 0).toLocaleString('en-IN')}.`,
            rawDate: new Date(tx.created_at || Date.now()),
            timestamp: formatDate(tx.created_at, 'datetime'),
            link: '/wallet',
            linkText: 'View Wallet'
          })
        })

        // Payouts
        payouts.slice(0, 5).forEach(p => {
          aggregated.push({
            id: `pay-${p.id}`,
            category: 'COMMISSION',
            title: `Payout Request #${p.request_number} (${p.status})`,
            message: `Your withdrawal request of ₹${Number(p.net_payable || p.amount).toLocaleString('en-IN')} is ${p.status?.toLowerCase()}.`,
            rawDate: new Date(p.created_at || Date.now()),
            timestamp: formatDate(p.created_at, 'datetime'),
            link: '/payout',
            linkText: 'View Payout'
          })
        })

        // Corporate Notices
        notices.slice(0, 10).forEach(notice => {
          aggregated.push({
            id: `not-${notice.id}`,
            category: notice.category === 'EVENT' || notice.category === 'OFFER' ? 'COMMISSION' : 'SYSTEM',
            title: notice.title,
            message: notice.content,
            rawDate: new Date(notice.published_at || notice.created_at || Date.now()),
            timestamp: formatDate(notice.published_at || notice.created_at, 'datetime'),
            link: '/dashboard',
            linkText: 'View Notice'
          })
        })

        // If no alerts found yet, show welcoming alert
        if (aggregated.length === 0) {
          aggregated.push({
            id: 'system-welcome',
            category: 'SYSTEM',
            title: 'Welcome to Jample Life!',
            message: 'Your distributor account is active. Order products, refer associates, and track your business volume here.',
            rawDate: new Date(),
            timestamp: 'Just now',
            link: '/shop',
            linkText: 'Explore Products'
          })
        }

        // Sort descending
        aggregated.sort((a, b) => b.rawDate - a.rawDate)
        setNotifications(aggregated)
      } catch (err) {
        console.error('Failed to load notifications:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [profile?.id, user?.id])

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map(n => n.id)
    setReadIds(allIds)
    try {
      localStorage.setItem('jample_read_notifs', JSON.stringify(allIds))
      window.dispatchEvent(new Event('jample_notifications_read'))
    } catch (e) {
      console.warn(e)
    }
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const handleToggleRead = (id) => {
    setReadIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      try {
        localStorage.setItem('jample_read_notifs', JSON.stringify(next))
        window.dispatchEvent(new Event('jample_notifications_read'))
      } catch (e) {
        console.warn(e)
      }
      return next
    })
  }

  const filteredNotifications = filter === 'ALL'
    ? notifications
    : notifications.filter(n => n.category === filter)

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'COMMISSION':
        return <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0"><DollarSign className="w-5 h-5" /></div>
      case 'ORDERS':
        return <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><ShoppingBag className="w-5 h-5" /></div>
      case 'TEAM':
        return <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5" /></div>
      case 'SYSTEM':
      default:
        return <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0"><AlertCircle className="w-5 h-5" /></div>
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Notifications & Alerts</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-burgundy-100 text-burgundy-800 font-bold text-xs rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Real-time alerts on commissions, orders, team genealogy, and system notices</p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'COMMISSION', 'ORDERS', 'TEAM', 'SYSTEM'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === tab
                ? 'bg-burgundy-700 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab === 'ALL' ? 'All Alerts' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-burgundy-600 animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading live notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No notifications found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You're all caught up! When you earn commissions, make orders, or receive company announcements, notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isRead = readIds.includes(notif.id)
            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  isRead
                    ? 'bg-white border-gray-100 hover:border-gray-200'
                    : 'bg-burgundy-50/20 border-burgundy-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {getCategoryIcon(notif.category)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{notif.title}</h3>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-burgundy-600"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{notif.timestamp}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center pl-13 sm:pl-0">
                  {notif.link && (
                    <Link
                      to={notif.link}
                      className="text-xs font-bold text-burgundy-700 hover:text-burgundy-800 flex items-center gap-1 hover:underline"
                    >
                      {notif.linkText}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <button
                    onClick={() => handleToggleRead(notif.id)}
                    title={isRead ? 'Mark as Unread' : 'Mark as Read'}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <CheckCheck className={`w-4 h-4 ${isRead ? 'text-gray-400' : 'text-burgundy-600'}`} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
