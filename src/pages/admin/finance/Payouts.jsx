import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Wallet, CheckCircle2, XCircle, AlertCircle, Search,
  Filter, Building2, CreditCard, Clock, ChevronRight, X
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getPayoutRequests, updatePayoutStatus } from '@/services/dbService'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([])
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [utrRef, setUtrRef] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [actionType, setActionType] = useState(null) // 'APPROVE' | 'REJECT'

  useEffect(() => {
    getPayoutRequests().then(setPayouts).catch(() => setPayouts([]))
  }, [])

  const handleApprove = async (id) => {
    try {
      const updated = await updatePayoutStatus(id, 'APPROVED', utrRef ? `UTR: ${utrRef}` : null)
      setPayouts(prev => prev.map(p => p.id === id ? updated : p))
      setSelectedPayout(null)
      setUtrRef('')
      toast.success('Payout approved and marked as PAID!')
    } catch (err) {
      toast.error('Failed to approve payout: ' + err.message)
    }
  }

  const handleReject = async (id) => {
    if (!rejectReason || rejectReason.length < 10) {
      toast.error('Rejection reason must be at least 10 characters.')
      return
    }
    try {
      const updated = await updatePayoutStatus(id, 'REJECTED', rejectReason)
      setPayouts(prev => prev.map(p => p.id === id ? updated : p))
      setSelectedPayout(null)
      setRejectReason('')
      toast.success('Payout request rejected with remarks logged!')
    } catch (err) {
      toast.error('Failed to reject payout: ' + err.message)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Distributor Payout &amp; Withdrawal Requests
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, approve, and disburse bank transfers to verified distributor accounts
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Payout #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Gross Req</th>
                <th className="py-3 px-4">TDS (5%)</th>
                <th className="py-3 px-4">Admin (5%)</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Reference / UTR</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {payouts.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {pay.request_number || pay.payout_number || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {formatDate(pay.created_at || pay.requested_at)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {pay.bank_name ? `${pay.bank_name} (**${(pay.bank_account_number || '').slice(-4)})` : (pay.profiles?.full_name || '—')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatCurrency(pay.amount || pay.requested_amount || 0)}
                  </td>
                  <td className="py-3.5 px-4 text-rose-600 font-medium">
                    -{formatCurrency(pay.tds_amount || pay.tds_deduction || 0)}
                  </td>
                  <td className="py-3.5 px-4 text-rose-600 font-medium">
                    -{formatCurrency(pay.admin_fee || pay.admin_charge || 0)}
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-600">
                    {formatCurrency(pay.net_payable || pay.net_payout || 0)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {pay.remarks || pay.payment_reference || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={pay.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {pay.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedPayout(pay)
                            setActionType('APPROVE')
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPayout(pay)
                            setActionType('REJECT')
                          }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px]"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for approval / rejection */}
      {selectedPayout && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {actionType === 'APPROVE' ? 'Approve & Mark Payout Paid' : 'Reject Payout Request'}
              </h3>
              <button onClick={() => setSelectedPayout(null)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionType === 'APPROVE' ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <p><strong>Request:</strong> {selectedPayout.payout_number}</p>
                  <p><strong>Net Amount:</strong> {formatCurrency(selectedPayout.net_payout)}</p>
                  <p><strong>Bank:</strong> {selectedPayout.bank_account_preview}</p>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank UTR / Transaction Reference</label>
                  <input
                    type="text"
                    value={utrRef}
                    onChange={(e) => setUtrRef(e.target.value)}
                    placeholder="e.g. UTR92847192847"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleApprove(selectedPayout.id)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  Confirm Bank Transfer &amp; Mark Paid
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason for Rejection (Min 10 chars)</label>
                  <textarea
                    rows="3"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Bank IFSC code invalid or account name mismatch."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleReject(selectedPayout.id)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  Reject Request
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
