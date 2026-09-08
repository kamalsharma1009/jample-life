import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { 
  Lock, Bell, Shield, Smartphone, Globe, Eye, EyeOff, 
  CheckCircle2, AlertCircle, Save, KeyRound, LogOut, Laptop
} from 'lucide-react'

export default function Settings() {
  const { profile, signOut } = useAuthStore()

  const [notificationPrefs, setNotificationPrefs] = useState({
    email_commissions: true,
    email_orders: true,
    email_news: false,
    sms_payouts: true,
    whatsapp_downline: true,
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleTogglePref = (key) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (!passwordData.new_password || passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match or cannot be empty!')
      return
    }
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    setSuccessMessage('Password changed successfully!')
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Account & Security Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure security credentials, notification channels, and active sessions</p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Security & Password */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Change Password Form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <KeyRound className="w-5 h-5 text-burgundy-600" />
              <h2 className="text-base font-bold text-gray-900">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    placeholder="Min 8 characters"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Two-Factor Authentication (2FA) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-burgundy-600" />
                <div>
                  <h2 className="text-base font-bold text-gray-900">Two-Factor Authentication (2FA)</h2>
                  <p className="text-xs text-gray-500">Add an extra layer of security to your payout and wallet transactions.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  twoFactorEnabled ? 'bg-burgundy-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {twoFactorEnabled && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 text-xs text-gray-600 space-y-2">
                <p className="font-bold text-gray-900">Google Authenticator / SMS OTP is active</p>
                <p>Every time you request a wallet withdrawal or payout transfer, a 6-digit one-time passcode will be verified.</p>
              </div>
            )}
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <Laptop className="w-5 h-5 text-burgundy-600" />
              <h2 className="text-base font-bold text-gray-900">Active Login Sessions</h2>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Chrome on Windows (Current Session)</p>
                    <p className="text-[11px] text-gray-500">IP: 103.24.89.12 • Gurugram, India</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  ACTIVE NOW
                </span>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Jample Mobile App (Android)</p>
                    <p className="text-[11px] text-gray-500">IP: 103.24.89.15 • Last active 2 days ago</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Notification Preferences & Language */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <Bell className="w-5 h-5 text-burgundy-600" />
              <h2 className="text-base font-bold text-gray-900">Notification Channels</h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-bold text-gray-900">Email: Commission Credits</p>
                  <p className="text-gray-500 text-[11px]">Instant email on Monday settlement</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.email_commissions}
                  onChange={() => handleTogglePref('email_commissions')}
                  className="rounded text-burgundy-600 focus:ring-burgundy-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-bold text-gray-900">Email: Order Dispatches</p>
                  <p className="text-gray-500 text-[11px]">Tracking number & delivery updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.email_orders}
                  onChange={() => handleTogglePref('email_orders')}
                  className="rounded text-burgundy-600 focus:ring-burgundy-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-bold text-gray-900">WhatsApp: Downline Joining</p>
                  <p className="text-gray-500 text-[11px]">Get WhatsApp notification on new referral</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.whatsapp_downline}
                  onChange={() => handleTogglePref('whatsapp_downline')}
                  className="rounded text-burgundy-600 focus:ring-burgundy-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-bold text-gray-900">SMS: Payout Bank Transfer</p>
                  <p className="text-gray-500 text-[11px]">Bank UTR confirmation over SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.sms_payouts}
                  onChange={() => handleTogglePref('sms_payouts')}
                  className="rounded text-burgundy-600 focus:ring-burgundy-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <Globe className="w-5 h-5 text-burgundy-600" />
              <h2 className="text-base font-bold text-gray-900">Preferences</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Display Currency</label>
                <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800">
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Interface Language</label>
                <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800">
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={signOut}
            className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out from Account
          </button>

        </div>

      </div>
    </div>
  )
}
