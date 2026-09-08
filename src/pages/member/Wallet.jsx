import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet, ArrowUpRight, ArrowDownLeft, ArrowRight, Search,
  Filter, Download, CheckCircle2, ShieldCheck, ShoppingBag, Clock, Loader2
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getWalletTransactions } from '@/services/dbService'
import { useAuthStore } from '@/stores/authStore'

// Derive entry_type from transaction_type column
function getEntryType(tx) {
  if (tx.entry_type) return tx.entry_type
  const creditTypes = ['COMMISSION_CREDIT', 'SETTLEMENT_CREDIT', 'DIRECT_BONUS', 'ACTIVATION_BONUS', 'REFERRAL_BONUS']
  return creditTypes.includes(tx.transaction_type) ? 'CREDIT' : 'DEBIT'
}

export default function WalletPage() {
  const { profile } = useAuthStore()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getWalletTransactions(profile?.id)
        setTransactions(data)
      } catch (err) {
        console.warn('[WalletPage] Failed to load transactions:', err)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile?.id])

  const walletBalance = profile?.wallet_balance ?? 0
  const totalEarned = profile?.total_earned ?? 0

  const filteredTransactions = transactions.filter((tx) => {
    const entryType = getEntryType(tx)
    const matchesSearch =
      (tx.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.reference_id || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType =
      selectedType === 'ALL' ||
      (selectedType === 'CREDIT' && entryType === 'CREDIT') ||
      (selectedType === 'DEBIT' && entryType === 'DEBIT')
    return matchesSearch && matchesType
  })

  // Compute totals from live data
  const totalWithdrawn = transactions
    .filter(tx => getEntryType(tx) === 'DEBIT')
    .reduce((sum, tx) => sum + Number(tx.amount), 0)

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Member Wallet &amp; Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time balance, weekly settlement credits, purchase debits, and withdrawal records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/payout"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
            Request Payout
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-jample-burgundy text-white font-bold text-xs hover:bg-jample-burgundy/90 transition shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop with Wallet
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          WALLET BALANCE CARDS
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Balance</span>
            <Wallet className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300 mt-3">
            {formatCurrency(walletBalance)}
          </div>
          <p className="text-xs text-slate-400 mt-2">Available for payout or checkout</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Credited</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(totalEarned)}
          </div>
          <p className="text-xs text-emerald-600 font-bold mt-2">Lifetime commission pool</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Withdrawn</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {loading ? '—' : formatCurrency(totalWithdrawn)}
          </div>
          <p className="text-xs text-slate-500 mt-2">Transferred to Bank Account</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transactions</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {loading ? '—' : transactions.length}
          </div>
          <p className="text-xs text-slate-500 mt-2">All ledger entries on record</p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          TRANSACTION LEDGER
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by reference or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedType === type
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All Transactions' : type === 'CREDIT' ? 'Credits (+)' : 'Debits (-)'}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-jample-burgundy mx-auto" />
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">No transactions found.</td>
                </tr>
              ) : filteredTransactions.map((tx) => {
                const entryType = getEntryType(tx)
                return (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {formatDate(tx.created_at)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      entryType === 'CREDIT'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {entryType === 'CREDIT' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      {entryType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {tx.description}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {tx.reference_id || '—'}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-black ${
                    entryType === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {entryType === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatCurrency(tx.balance_after)}
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
