import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, ShieldCheck, Award, Users, Wallet, Lock, Unlock,
  CheckCircle2, AlertCircle, Edit3, Save, RefreshCw, Mail, Phone,
  MapPin, Calendar, GitBranch, ShoppingBag, TrendingUp, Sparkles, X
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatNumber, formatDate, getRankDisplay } from '@/lib/utils'
import { getMemberById } from '@/services/dbService'
import { supabase } from '@/lib/supabase'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminMemberDetail() {
  const { id } = useParams()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedRank, setSelectedRank] = useState('MEMBER')
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE')
  const [selectedKyc, setSelectedKyc] = useState('VERIFIED')
  const [walletAdjustment, setWalletAdjustment] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [isAdjustingWallet, setIsAdjustingWallet] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', mobile: '', email: '' })

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getMemberById(id)
        if (data) {
          setMember(data)
          setSelectedRank(data.rank_code)
          setSelectedStatus(data.status)
          setSelectedKyc(data.kyc_status)
          setEditForm({
            full_name: data.full_name || '',
            mobile: data.mobile || '',
            email: data.email || '',
          })
        }
      } catch (err) {
        console.error('Error fetching member from Supabase:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-bold">Loading member from Supabase...</div>
  }

  if (!member) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-base font-bold text-slate-700">Member not found in Supabase database.</p>
        <Link to="/admin/members" className="text-xs font-bold text-[#853953] hover:underline">
          Return to Member Directory
        </Link>
      </div>
    )
  }

  const handleSaveMemberDetails = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          mobile: editForm.mobile,
          email: editForm.email,
        })
        .eq('id', member.id)
        .select()
        .single()

      if (error) throw error
      setMember({ ...member, ...data })
      setIsEditModalOpen(false)
      toast.success(`Distributor details updated directly in Supabase!`)
    } catch (err) {
      toast.error('Failed to update in Supabase: ' + err.message)
    }
  }

  const handleUpdateRank = async () => {
    try {
      await supabase.from('profiles').update({ rank_code: selectedRank }).eq('id', member.id)
      setMember({ ...member, rank_code: selectedRank })
      toast.success(`Rank updated to ${getRankDisplay(selectedRank).name} in Supabase!`)
    } catch (e) {
      toast.error('Failed to update rank: ' + e.message)
    }
  }

  const handleUpdateStatus = async () => {
    try {
      await supabase.from('profiles').update({ status: selectedStatus }).eq('id', member.id)
      setMember({ ...member, status: selectedStatus })
      toast.success(`Account status updated to ${selectedStatus} in Supabase!`)
    } catch (e) {
      toast.error('Failed to update status: ' + e.message)
    }
  }

  const handleUpdateKyc = async () => {
    try {
      await supabase.from('profiles').update({ kyc_status: selectedKyc }).eq('id', member.id)
      setMember({ ...member, kyc_status: selectedKyc })
      toast.success(`KYC status updated to ${selectedKyc} in Supabase!`)
    } catch (e) {
      toast.error('Failed to update KYC: ' + e.message)
    }
  }
  const handleWalletAdjustment = async (type) => {
    const amount = parseFloat(walletAdjustment)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!adjustReason) {
      toast.error('Please enter an audit reason for wallet adjustment.')
      return
    }

    try {
      const newBalance = type === 'CREDIT'
        ? Number(member.wallet_balance || 0) + amount
        : Math.max(0, Number(member.wallet_balance || 0) - amount)

      await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', member.id)
      setMember({ ...member, wallet_balance: newBalance })
      setWalletAdjustment('')
      setAdjustReason('')
      setIsAdjustingWallet(false)
      toast.success(`Wallet ${type === 'CREDIT' ? 'credited' : 'debited'} ₹${amount} in Supabase!`)
    } catch (e) {
      toast.error('Failed to update wallet: ' + e.message)
    }
  }

  return (
  <div className="space-y-8 pb-16">
    {/* ─────────────────────────────────────────────
          BREADCRUMB & HEADER
      ───────────────────────────────────────────── */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/admin/members" className="hover:text-jample-burgundy flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Distributor Directory
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{member.full_name} ({member.member_id})</span>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={member.status} />
        <StatusBadge status={member.kyc_status} />
      </div>
    </div>

    {/* ─────────────────────────────────────────────
          MEMBER PROFILE BANNER
      ───────────────────────────────────────────── */}
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-jample-burgundy text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
          {member.full_name.charAt(0)}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{member.full_name}</h1>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {getRankDisplay(member.rank_code).name}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Member ID: <strong className="font-mono text-slate-800">{member.member_id}</strong> &bull; Sponsor: {member.sponsor_name} ({member.sponsor_id})
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {member.email}</span>
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {member.mobile}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {member.city}, {member.state}</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-jample-burgundy hover:bg-jample-burgundy/90 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
        >
          <Edit3 className="w-4 h-4" />
          Edit Member Info
        </button>
        <button
          onClick={() => setIsAdjustingWallet(!isAdjustingWallet)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
        >
          <Wallet className="w-4 h-4 text-amber-400" />
          Adjust Wallet Balance
        </button>
        <Link
          to="/admin/genealogy"
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <GitBranch className="w-4 h-4 text-purple-600" />
          Locate in Genealogy Tree
        </Link>
      </div>
    </div>

    {/* ─────────────────────────────────────────────
          WALLET ADJUSTMENT DRAWER (ADMIN ONLY)
      ───────────────────────────────────────────── */}
    {isAdjustingWallet && (
      <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Manual Wallet Adjustment (Audit Controlled)
          </h3>
          <span className="text-xs font-bold text-amber-900">Current Bal: {formatCurrency(member.wallet_balance)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={walletAdjustment}
              onChange={(e) => setWalletAdjustment(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-bold focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-amber-900 mb-1">Adjustment Reason / Audit Reference</label>
            <input
              type="text"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Promotional adjustment or verified manual commission credit"
              className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => handleWalletAdjustment('DEBIT')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
          >
            Debit (-)
          </button>
          <button
            onClick={() => handleWalletAdjustment('CREDIT')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
          >
            Credit (+)
          </button>
        </div>
      </div>
    )}

    {/* ─────────────────────────────────────────────
          FINANCIAL & VOLUME METRICS
      ───────────────────────────────────────────── */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Wallet</span>
        <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(member.wallet_balance)}</div>
        <p className="text-xs text-slate-500 mt-1">Lifetime Earned: {formatCurrency(member.total_earned)}</p>
      </div>
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Qualification</span>
        <div className="text-2xl font-black text-jample-burgundy mt-1">{member.personal_pv} PV</div>
        <p className="text-xs text-slate-500 mt-1">{member.personal_bv} BV recorded this cycle</p>
      </div>
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Network Size</span>
        <div className="text-2xl font-black text-purple-600 mt-1">{member.total_downline_count} Members</div>
        <p className="text-xs text-slate-500 mt-1">{member.direct_referrals_count} Direct frontline sponsors</p>
      </div>
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Business Volume</span>
        <div className="text-2xl font-black text-emerald-600 mt-1">{formatNumber(member.team_bv)} BV</div>
        <p className="text-xs text-emerald-600 font-bold mt-1">Active for 13-tier overrides</p>
      </div>
    </div>

    {/* ─────────────────────────────────────────────
          ADMIN CONTROLS: RANK, STATUS, KYC OVERRIDE
      ───────────────────────────────────────────── */}
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-base font-bold text-slate-900">Distributor Status &amp; Privilege Controls</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rank Control */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-700">Change Leadership Rank</label>
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="MEMBER">Member (0% Bonus)</option>
            <option value="JAMPLE_DIRECTOR">Jample Director (10% Bonus)</option>
            <option value="MARKETING_DIRECTOR">Marketing Director (5% Bonus)</option>
            <option value="BUSINESS_DIRECTOR">Business Director (2% Bonus)</option>
            <option value="GOLD_DIRECTOR">Gold Director (1.5% Bonus)</option>
            <option value="PLATINUM_DIRECTOR">Platinum Director (1.0% Bonus)</option>
            <option value="DIAMOND_DIRECTOR">Diamond Director (0.5% Bonus)</option>
          </select>
          <button
            onClick={handleUpdateRank}
            className="w-full py-2 bg-jample-burgundy text-white rounded-xl text-xs font-bold hover:bg-jample-burgundy/90 transition shadow-sm"
          >
            Save Rank Update
          </button>
        </div>

        {/* Account Status Control */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-700">Account Security Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="ACTIVE">ACTIVE (Full access)</option>
            <option value="PENDING">PENDING (Unverified)</option>
            <option value="BLOCKED">BLOCKED (Locked out)</option>
            <option value="SUSPENDED">SUSPENDED (Under review)</option>
          </select>
          <button
            onClick={handleUpdateStatus}
            className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm"
          >
            Save Status Update
          </button>
        </div>

        {/* KYC Verification Control */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-700">KYC Compliance Review</label>
          <select
            value={selectedKyc}
            onChange={(e) => setSelectedKyc(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="VERIFIED">VERIFIED (Payouts Enabled)</option>
            <option value="PENDING">PENDING (Documents uploaded)</option>
            <option value="UNSUBMITTED">UNSUBMITTED</option>
            <option value="REJECTED">REJECTED (Resubmission required)</option>
          </select>
          <button
            onClick={handleUpdateKyc}
            className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
          >
            Update KYC Status
          </button>
        </div>
      </div>
    </div>

    {/* Edit Member Info Modal */}
    {isEditModalOpen && createPortal(
      <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Edit Distributor Details</h3>
              <p className="text-xs text-slate-500">Live Supabase profiles update</p>
            </div>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveMemberDetails} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number</label>
              <input
                type="text"
                value={editForm.mobile}
                onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-jample-burgundy text-white font-bold text-xs hover:bg-jample-burgundy/90 transition shadow-sm"
              >
                Save to Supabase
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )}
  </div>
)
}
