import { useState, useEffect } from 'react'
import { Wallet, Search, ArrowDownLeft, ArrowUpRight, ShieldCheck, Download } from 'lucide-react'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import { getWalletTransactions } from '@/services/dbService'

function getEntryType(tx) {
  if (tx.entry_type) return tx.entry_type
  const creditTypes = ['COMMISSION_CREDIT', 'SETTLEMENT_CREDIT', 'DIRECT_BONUS', 'ACTIVATION_BONUS', 'REFERRAL_BONUS']
  return creditTypes.includes(tx.transaction_type) ? 'CREDIT' : 'DEBIT'
}

export default function AdminWallet() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    getWalletTransactions().then(setTransactions).catch(() => setTransactions([]))
  }, [])
  const totalPoolBalance = 184500.00

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Company Wallet &amp; Treasury Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Master audit trail of all commission disbursements, member withdrawals, and product purchase credits
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Member Wallet Reserves</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{formatCurrency(totalPoolBalance)}</div>
          <p className="text-xs text-slate-500 mt-1">Stored across active member accounts</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lifetime Paid Commissions</span>
          <div className="text-3xl font-black text-emerald-600 mt-2">{formatCurrency(1248000)}</div>
          <p className="text-xs text-slate-500 mt-1">Disbursed via Monday settlements</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">TDS Remitted to Govt</span>
          <div className="text-3xl font-black text-jample-burgundy mt-2">{formatCurrency(62400)}</div>
          <p className="text-xs text-slate-500 mt-1">5% TDS Section 194H</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Recent Treasury Transactions</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map((tx) => {
                const entryType = getEntryType(tx)
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{formatDate(tx.created_at)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entryType === 'CREDIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{tx.description}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{tx.reference_id}</td>
                    <td className={`py-3.5 px-4 text-right font-black ${
                      entryType === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {entryType === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(tx.balance_after)}</td>
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
