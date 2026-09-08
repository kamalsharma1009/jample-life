import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Wallet, Building2, QrCode, ArrowRight, ShieldCheck,
  CheckCircle2, Clock, AlertCircle, Loader2, RefreshCw, Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getPayoutRequests, createPayoutRequest, updateBankDetails } from '@/services/dbService'
import { useAuthStore } from '@/stores/authStore'
import { bankDetailsSchema, payoutRequestSchema } from '@/lib/validations'
import StatusBadge from '@/components/shared/StatusBadge'

export default function PayoutPage() {
  const { profile } = useAuthStore()

  // Build bankDetails from profile columns safely
  const [bankDetails, setBankDetails] = useState({
    account_holder: profile?.full_name || '',
    bank_name: profile?.bank_name || '',
    account_number: profile?.bank_account || '',
    ifsc: profile?.bank_ifsc || '',
    upi_id: '',
    pan: profile?.pan_number || '',
    verified: !!(profile?.bank_name && profile?.bank_account && profile?.kyc_status === 'VERIFIED'),
  })
  const [payouts, setPayouts] = useState([])
  const [isEditingBank, setIsEditingBank] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [requestedAmount, setRequestedAmount] = useState('')

  // Bank details form
  const {
    register: registerBank,
    handleSubmit: handleSubmitBank,
    reset: resetBank,
    formState: { errors: bankErrors },
  } = useForm({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      bank_account_holder: profile?.full_name || '',
      bank_name: profile?.bank_name || '',
      account_number: profile?.bank_account || '',
      ifsc: profile?.bank_ifsc || '',
      upi_id: '',
      preferred_method: 'BANK_TRANSFER',
    },
  })

  // Load bank details when profile changes
  useEffect(() => {
    if (profile) {
      const b = {
        account_holder: profile.full_name || '',
        bank_name: profile.bank_name || '',
        account_number: profile.bank_account || '',
        ifsc: profile.bank_ifsc || '',
        upi_id: '',
        pan: profile.pan_number || '',
        verified: !!(profile.bank_name && profile.bank_account && profile.kyc_status === 'VERIFIED'),
      }
      setBankDetails(b)
      resetBank({
        bank_account_holder: b.account_holder,
        bank_name: b.bank_name,
        account_number: b.account_number,
        ifsc: b.ifsc,
        upi_id: '',
        preferred_method: 'BANK_TRANSFER',
      })
    }
  }, [profile, resetBank])

  // Load payout requests
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getPayoutRequests(profile?.id)
        setPayouts(data)
      } catch (err) {
        console.warn('[PayoutPage] Failed to load payouts:', err)
        setPayouts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile?.id])

  const walletBalance = profile?.wallet_balance ?? 0
  const kycStatus = profile?.kyc_status || 'PENDING'
  const isKycVerified = kycStatus === 'VERIFIED'

  // Deduction calculation
  const numAmount = parseFloat(requestedAmount) || 0
  const tdsDeduction = numAmount * 0.05
  const adminDeduction = numAmount * 0.05
  const netPayable = Math.max(0, numAmount - tdsDeduction - adminDeduction)

  const onSaveBank = async (data) => {
    try {
      if (profile?.id) {
        await updateBankDetails(profile.id, {
          bank_name: data.bank_name,
          account_number: data.account_number,
          ifsc: data.ifsc,
          pan: data.pan_number || '',
        })
      }
      setBankDetails(prev => ({
        ...prev,
        bank_name: data.bank_name,
        account_number: data.account_number,
        ifsc: data.ifsc,
        verified: true,
      }))
      setIsEditingBank(false)
      toast.success('Bank details updated successfully!')
    } catch (err) {
      toast.error('Failed to save bank details: ' + err.message)
    }
  }

  const handleRequestPayout = async (e) => {
    e.preventDefault()
    if (!isKycVerified) {
      toast.error('KYC verification is required before requesting a payout.')
      return
    }
    if (!bankDetails?.account_number) {
      toast.error('Please link your destination bank account before requesting a withdrawal.')
      return
    }
    if (numAmount < 100) {
      toast.error('Minimum payout amount is ₹100.')
      return
    }
    if (numAmount > walletBalance) {
      toast.error('Requested amount exceeds your available wallet balance.')
      return
    }
    if (numAmount > 100000) {
      toast.error('Maximum payout request is ₹1,00,000 per transaction.')
      return
    }

    setIsSubmitting(true)
    try {
      const newPayout = await createPayoutRequest({
        member_id: profile.id,
        amount: numAmount,
        tds_amount: tdsDeduction,
        admin_fee: adminDeduction,
        net_payable: netPayable,
        bank_name: bankDetails?.bank_name || '',
        bank_account_number: bankDetails?.account_number || '',
        bank_ifsc: bankDetails?.ifsc || '',
      })
      setPayouts(prev => [newPayout, ...prev])
      setRequestedAmount('')
      toast.success('Payout request submitted for admin review!')
    } catch (err) {
      toast.error('Failed to submit payout request: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Payout &amp; Bank Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your verified bank account and submit direct withdrawal requests
          </p>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold ${
          isKycVerified
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {isKycVerified ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          ) : (
            <Clock className="w-4 h-4 text-amber-600" />
          )}
          <span>KYC Status: {kycStatus}</span>
        </div>
      </div>

      {/* KYC Warning Banner when pending or unverified */}
      {!isKycVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-900">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">KYC Verification Required for Payouts</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Your KYC is currently <strong>{kycStatus}</strong>. Complete your government ID and bank proof verification in the KYC portal before payouts can be processed.
              </p>
            </div>
          </div>
          <Link
            to="/kyc"
            className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-xs whitespace-nowrap"
          >
            Complete KYC &rarr;
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          PAYOUT REQUEST & BANK DETAILS FORMS
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Request Payout Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Request Withdrawal</h2>
              <p className="text-xs text-slate-500">Withdraw available funds directly to your verified bank</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Available</span>
              <span className="text-base font-black text-slate-900">{formatCurrency(walletBalance)}</span>
            </div>
          </div>

          <form onSubmit={handleRequestPayout} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Withdrawal Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                <input
                  type="number"
                  min="100"
                  max={walletBalance}
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="Enter amount (min ₹100)"
                  className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 text-base font-bold focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                <span>Min: ₹100 &bull; Max: ₹1,00,000</span>
                <button
                  type="button"
                  onClick={() => setRequestedAmount(walletBalance.toString())}
                  className="text-jample-burgundy font-bold hover:underline"
                >
                  Withdraw All ({formatCurrency(walletBalance)})
                </button>
              </div>
            </div>

            {/* Live deduction breakdown */}
            {numAmount > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Requested:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(numAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>5% TDS Deduction (Section 194H):</span>
                  <span>-{formatCurrency(tdsDeduction)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>5% Administrative Fee:</span>
                  <span>-{formatCurrency(adminDeduction)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-emerald-700 pt-2 border-t border-slate-200">
                  <span>Net Credited to Bank:</span>
                  <span>{formatCurrency(netPayable)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || numAmount <= 0}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  Submit Payout Request
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Bank Details Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Destination Account</h3>
            <button
              onClick={() => setIsEditingBank(!isEditingBank)}
              className="text-xs font-bold text-jample-burgundy hover:underline"
            >
              {isEditingBank ? 'Cancel' : 'Edit Account'}
            </button>
          </div>

          {isEditingBank ? (
            <form onSubmit={handleSubmitBank(onSaveBank)} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  {...registerBank('bank_account_holder')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                />
                {bankErrors.bank_account_holder && (
                  <p className="text-rose-600 mt-1">{bankErrors.bank_account_holder.message}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  {...registerBank('bank_name')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                />
                {bankErrors.bank_name && (
                  <p className="text-rose-600 mt-1">{bankErrors.bank_name.message}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  {...registerBank('account_number')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                />
                {bankErrors.account_number && (
                  <p className="text-rose-600 mt-1">{bankErrors.account_number.message}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  {...registerBank('ifsc')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy uppercase"
                />
                {bankErrors.ifsc && (
                  <p className="text-rose-600 mt-1">{bankErrors.ifsc.message}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">UPI ID (Optional)</label>
                <input
                  type="text"
                  {...registerBank('upi_id')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-jample-burgundy text-white rounded-xl font-bold shadow-sm hover:bg-jample-burgundy/90 transition"
              >
                Save Bank Details
              </button>
            </form>
          ) : !bankDetails?.account_number ? (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">No Bank Account Added</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    You have not linked any bank account yet. Add your bank details to receive withdrawal payouts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingBank(true)}
                  className="px-4 py-2 bg-jample-burgundy text-white rounded-xl text-xs font-bold shadow-xs hover:bg-jample-burgundy/90 transition"
                >
                  + Add Bank Details
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold bg-amber-50 p-3 rounded-xl border border-amber-100">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Bank account details required before submitting withdrawals</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Bank Name:</span>
                  <strong className="text-slate-900">{bankDetails.bank_name || '—'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Account Holder:</span>
                  <strong className="text-slate-900">{bankDetails.account_holder || profile?.full_name || '—'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Account Number:</span>
                  <strong className="font-mono text-slate-900">
                    •••• •••• •••• {bankDetails.account_number.slice(-4)}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">IFSC:</span>
                  <strong className="font-mono text-slate-900">{bankDetails.ifsc || '—'}</strong>
                </div>
              </div>

              {isKycVerified ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Bank Account Verified &bull; Active for Payouts</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Bank Account Added &bull; Pending KYC Approval</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          PAYOUT REQUESTS HISTORY
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Withdrawal Request History</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Gross Amount</th>
                <th className="py-3 px-4">TDS (5%)</th>
                <th className="py-3 px-4">Admin (5%)</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4 text-right">Status</th>
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
                    {pay.bank_name ? `${pay.bank_name} (**${(pay.bank_account_number || '').slice(-4)})` : (pay.bank_account_preview || '—')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatCurrency(pay.amount || pay.requested_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-rose-600 font-medium">
                    -{formatCurrency(pay.tds_amount || pay.tds_deduction)}
                  </td>
                  <td className="py-3.5 px-4 text-rose-600 font-medium">
                    -{formatCurrency(pay.admin_fee || pay.admin_charge)}
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-600">
                    {formatCurrency(pay.net_payable || pay.net_payout)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <StatusBadge status={pay.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
