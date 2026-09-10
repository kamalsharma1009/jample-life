import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Users, Search, Filter, UserPlus, ShieldCheck, Award,
  ChevronRight, X, CheckCircle2, Lock, Unlock, Mail, Phone,
  Sparkles, Loader2, Database
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatNumber, formatDate, getRankDisplay } from '@/lib/utils'
import { getMembers, createMember } from '@/services/dbService'
import { createMemberSchema } from '@/lib/validations'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedKyc, setSelectedKyc] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch members directly from Supabase
  const loadMembers = async () => {
    try {
      setLoading(true)
      const data = await getMembers()
      setMembers(data)
    } catch (err) {
      console.error('Error loading Supabase members:', err)
      toast.error('Could not load members from Supabase: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  // Form for creating new member
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      role: 'MEMBER',
      network_role: 'MEMBER',
      status: 'ACTIVE',
    },
  })

  const onAddMember = async (data) => {
    setIsSubmitting(true)
    try {
      const created = await createMember(data)
      setMembers([created, ...members])
      setIsModalOpen(false)
      reset()
      toast.success(`Distributor ${created.full_name} (${created.member_id}) saved directly to Supabase!`)
    } catch (err) {
      toast.error('Failed to create in Supabase: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.member_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mobile.includes(searchQuery)

    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus
    const matchesKyc = selectedKyc === 'ALL' || m.kyc_status === selectedKyc

    return matchesSearch && matchesStatus && matchesKyc
  })

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Distributor Network Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage distributor profiles, genealogical placement, KYC approvals, and account permissions
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-jample-burgundy text-white font-bold text-xs hover:bg-jample-burgundy/90 transition shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Enroll New Member
        </button>
      </div>

      {/* ─────────────────────────────────────────────
          DIRECTORY STATS
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{members.length} Members</div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Distributors</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {members.filter((m) => m.status === 'ACTIVE').length} Active
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending KYC Review</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {members.filter((m) => m.kyc_status === 'PENDING').length} Pending
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Qualified Leaders</span>
          <div className="text-2xl font-black text-jample-burgundy mt-1">
            {members.filter((m) => m.rank_code !== 'MEMBER').length} Directors
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          SEARCH & FILTERS
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, Member ID, email, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="BLOCKED">Blocked</option>
            </select>

            <select
              value={selectedKyc}
              onChange={(e) => setSelectedKyc(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All KYC</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="UNSUBMITTED">Unsubmitted</option>
            </select>
          </div>
        </div>

        {/* Member Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Member Info</th>
                <th className="py-3 px-4">Sponsor / Lineage</th>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Personal PV</th>
                <th className="py-3 px-4">Team BV</th>
                <th className="py-3 px-4">Wallet Bal</th>
                <th className="py-3 px-4">KYC</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{m.full_name}</div>
                    <div className="font-mono text-[11px] text-slate-400">{m.member_id} &bull; {m.mobile}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{m.sponsor_name || 'Direct'}</div>
                    <div className="text-[11px] text-slate-400">{m.network_name}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {getRankDisplay(m.rank_code).name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {m.personal_pv} PV
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    {formatNumber(m.team_bv)} BV
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    {formatCurrency(m.wallet_balance)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={m.kyc_status} />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/admin/members/${m.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition inline-flex items-center gap-1"
                    >
                      Inspect <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          CREATE MEMBER MODAL
      ───────────────────────────────────────────── */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Enroll New Distributor</h3>
                <p className="text-xs text-slate-500">Create member profile with assigned sponsor placement</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onAddMember)} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  {...register('full_name')}
                  placeholder="e.g. Anand Mahindra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                />
                {errors.full_name && <p className="text-rose-600 mt-1">{errors.full_name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                  />
                  {errors.email && <p className="text-rose-600 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 select-none border-r border-slate-300 pr-2 z-10">
                      +91
                    </span>
                    <input
                      type="tel"
                      {...register('mobile')}
                      placeholder="9876543210"
                      className="w-full pl-14 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                    />
                  </div>
                  {errors.mobile && <p className="text-rose-600 mt-1">{errors.mobile.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="Min 8 chars, 1 uppercase, 1 num"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                  />
                  {errors.password && <p className="text-rose-600 mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sponsor Referral Code</label>
                  <input
                    type="text"
                    {...register('referral_code')}
                    placeholder="e.g. JL-2026-0088"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy uppercase font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enroll Member'}
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
