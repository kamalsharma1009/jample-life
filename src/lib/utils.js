import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes safely, resolving conflicts.
 * @param {...string} inputs - Class strings or conditional class objects
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indian Rupees.
 * @param {number} amount
 * @param {object} options
 * @param {boolean} options.compact - Use compact notation (₹1.2L)
 * @returns {string}
 */
export function formatCurrency(amount, options = {}) {
  if (amount === null || amount === undefined) return '₹0'
  const num = parseFloat(amount)
  if (isNaN(num)) return '₹0'

  if (options.compact) {
    if (Math.abs(num) >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`
    if (Math.abs(num) >= 100000) return `₹${(num / 100000).toFixed(1)}L`
    if (Math.abs(num) >= 1000) return `₹${(num / 1000).toFixed(1)}K`
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Format a number as Indian number system.
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('en-IN').format(parseFloat(num) || 0)
}

/**
 * Format a date string.
 * @param {string|Date} date
 * @param {string} format - 'short' | 'medium' | 'long' | 'datetime'
 * @returns {string}
 */
export function formatDate(date, format = 'medium') {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'

  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    datetime: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  }

  return new Intl.DateTimeFormat('en-IN', options[format] || options.medium).format(d)
}

/**
 * Truncate a string to a max length with ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 30) {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '…'
}

/**
 * Generate initials from a full name.
 * @param {string} name
 * @returns {string} Up to 2 initials
 */
export function getInitials(name) {
  if (!name) return 'JL'
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

/**
 * Get status color classes for member status badges.
 * @param {string} status
 * @returns {object} { bg, text, dot }
 */
export function getStatusColors(status) {
  const map = {
    ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
    INACTIVE: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    BLOCKED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
    SUSPENDED: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' },
    VERIFIED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
    REJECTED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
    NOT_SUBMITTED: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' },
    PAID: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
    AVAILABLE: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    REQUESTED: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
    APPROVED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
    PROCESSING: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    FAILED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
    CANCELLED: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' },
    DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
    SHIPPED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    FINALIZED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
    CALCULATING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    OPEN: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    UNDER_REVIEW: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    SETTLED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
    CALCULATED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  }
  return map[status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' }
}

/**
 * Get rank display properties.
 * @param {string} rankCode
 * @returns {object}
 */
export function getRankDisplay(rankCode) {
  const map = {
    MEMBER: { label: 'Member', color: 'text-gray-600', bg: 'bg-gray-100', icon: '👤' },
    JAMPLE_DIRECTOR: { label: 'Jample Director', color: 'text-blue-700', bg: 'bg-blue-100', icon: '⭐' },
    MARKETING_DIRECTOR: { label: 'Marketing Director', color: 'text-purple-700', bg: 'bg-purple-100', icon: '🌟' },
    BUSINESS_DIRECTOR: { label: 'Business Director', color: 'text-indigo-700', bg: 'bg-indigo-100', icon: '💫' },
    GOLD_DIRECTOR: { label: 'Gold Director', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: '🥇' },
    PLATINUM_DIRECTOR: { label: 'Platinum Director', color: 'text-slate-700', bg: 'bg-slate-100', icon: '💎' },
    DIAMOND_DIRECTOR: { label: 'Diamond Director', color: 'text-jample-burgundy', bg: 'bg-pink-100', icon: '👑' },
  }
  return map[rankCode] || map.MEMBER
}

/**
 * Copy text to clipboard.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const result = document.execCommand('copy')
    document.body.removeChild(textarea)
    return result
  }
}

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a referral link from a referral code.
 * @param {string} referralCode
 * @returns {string}
 */
export function getReferralLink(referralCode) {
  const origin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : (import.meta.env.VITE_APP_URL || 'http://localhost:5173')
  return `${origin}/register?ref=${referralCode}`
}

/**
 * Safe JSON parse — returns null on failure.
 * @param {string} str
 * @returns {any}
 */
export function safeJsonParse(str) {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}
