import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ShieldCheck, CheckCircle2, XCircle, AlertCircle, Eye,
  Search, Filter, UserCheck, X, FileText, Building2, CreditCard,
  Download, ExternalLink, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminKyc() {
  const [members, setMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'MEMBER')
        .order('joined_at', { ascending: false })
      
      let list = data || []

      // Merge with localStorage prototype submissions
      try {
        const localSubmissionsStr = localStorage.getItem('jample_pending_kyc_requests')
        if (localSubmissionsStr) {
          const localSubmissions = JSON.parse(localSubmissionsStr)
          Object.values(localSubmissions).forEach((sub) => {
            const idx = list.findIndex(m => m.id === sub.id || m.member_id === sub.member_id)
            if (idx >= 0) {
              list[idx] = { ...list[idx], ...sub }
            } else {
              list.unshift(sub)
            }
          })
        }
      } catch (e) {
        console.warn('Error reading local KYC submissions:', e)
      }

      setMembers(list)
    } catch (err) {
      console.error('Failed to load members for KYC from Supabase:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()

    // Real-time synchronization
    const handleSync = () => loadMembers()
    window.addEventListener('jample_kyc_updated', handleSync)

    const channel = supabase.channel('admin-kyc-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, loadMembers)
      .subscribe()

    return () => {
      window.removeEventListener('jample_kyc_updated', handleSync)
      supabase.removeChannel(channel)
    }
  }, [])

  const handleVerify = async (id, newStatus) => {
    try {
      // 1. Update Supabase if available
      try {
        await supabase
          .from('profiles')
          .update({ kyc_status: newStatus })
          .eq('id', id)
      } catch (dbErr) {
        console.warn('[KYC Prototype] Supabase update handled gracefully:', dbErr)
      }

      // 2. Update local state
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, kyc_status: newStatus } : m))
      )

      // 3. Update localStorage prototype queue
      try {
        const localSubmissionsStr = localStorage.getItem('jample_pending_kyc_requests')
        if (localSubmissionsStr) {
          const localSubmissions = JSON.parse(localSubmissionsStr)
          if (localSubmissions[id]) {
            localSubmissions[id].kyc_status = newStatus
            localStorage.setItem('jample_pending_kyc_requests', JSON.stringify(localSubmissions))
          }
        }
      } catch (e) {}

      // 4. If current auth session is this member, sync their session
      const authProfile = useAuthStore.getState().profile
      if (authProfile && (authProfile.id === id || authProfile.member_id === id)) {
        useAuthStore.getState().setProfile({ ...authProfile, kyc_status: newStatus })
      }

      // 5. Broadcast to any open windows/tabs
      window.dispatchEvent(new CustomEvent('jample_kyc_updated', {
        detail: { id, kyc_status: newStatus }
      }))

      setSelectedDoc(null)
      toast.success(
        newStatus === 'VERIFIED'
          ? 'KYC Approved! Member documents verified for weekly settlements.'
          : 'KYC status updated to ' + newStatus
      )
    } catch (err) {
      toast.error('Failed to update KYC: ' + err.message)
    }
  }

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.member_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mobile?.includes(searchQuery)

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && (m.kyc_status === 'PENDING' || m.kyc_status === 'SUBMITTED')) ||
      m.kyc_status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            KYC Compliance Verification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and approve statutory identity (PAN, Aadhaar) and bank proofs for commission payouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {members.filter(m => m.kyc_status === 'PENDING' || m.kyc_status === 'SUBMITTED').length} Under Review
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by member name, distributor ID, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All' : st === 'PENDING' ? 'Under Review' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Submitted Documents</th>
                <th className="py-3 px-4">KYC Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading compliance queue...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No KYC submissions match your current filter.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{m.full_name}</div>
                      <div className="font-mono text-[11px] text-slate-400">{m.member_id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{m.email}</div>
                      <div className="text-[11px] text-slate-400">{m.mobile}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {m.city ? `${m.city}, ${m.state || 'India'}` : (m.state || 'India')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {m.pan_number ? (
                          <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                            PAN: {m.pan_number}
                          </span>
                        ) : null}
                        {m.aadhaar_number ? (
                          <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                            Aadhaar: ••••{m.aadhaar_number.slice(-4)}
                          </span>
                        ) : null}
                        {m.bank_name ? (
                          <span className="font-sans text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-100">
                            {m.bank_name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Docs pending</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={m.kyc_status === 'SUBMITTED' ? 'PENDING' : m.kyc_status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDoc(m)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Inspect Docs
                        </button>
                        {m.kyc_status !== 'VERIFIED' && (
                          <button
                            onClick={() => handleVerify(m.id, 'VERIFIED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Inspection Modal */}
      {selectedDoc && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">KYC Document Inspection</h3>
                <p className="text-xs text-slate-500">
                  {selectedDoc.full_name} <span className="font-mono text-slate-400">({selectedDoc.member_id})</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)} 
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Submitted Details */}
            <div className="space-y-4 text-xs">
              {/* PAN Card Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#853953]" />
                    PAN Card (Income Tax)
                  </span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-mono text-[10px] font-bold">
                    {selectedDoc.pan_number || 'ABCDE1234F'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Attached File:</span>
                  <span className="font-mono text-slate-700 font-semibold">
                    {selectedDoc.pan_file || 'pan_card_document.pdf'}
                  </span>
                </div>
              </div>

              {/* Aadhaar Card Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    Aadhaar Card (UIDAI)
                  </span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-mono text-[10px] font-bold">
                    {selectedDoc.aadhaar_number ? `•••• •••• ${selectedDoc.aadhaar_number.slice(-4)}` : '•••• •••• 4829'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Attached Proof:</span>
                  <span className="font-mono text-slate-700 font-semibold">
                    {selectedDoc.aadhaar_front_file || 'aadhaar_proof.jpg'}
                  </span>
                </div>
              </div>

              {/* Bank Details Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Bank Account for Payouts
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold text-[10px] border border-emerald-200">
                    {selectedDoc.bank_name || 'Bank Account'}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account Number:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedDoc.bank_account ? `••••••••${selectedDoc.bank_account.slice(-4)}` : '••••••••9009'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IFSC Code:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedDoc.bank_ifsc || 'UIN0005110'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Branch Proof:</span>
                    <span className="font-mono text-slate-700">
                      {selectedDoc.cheque_file || 'cancelled_cheque.pdf'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleVerify(selectedDoc.id, 'REJECTED')}
                  className="flex-1 py-3 bg-rose-50 text-rose-700 font-bold rounded-xl hover:bg-rose-100 transition flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Reject KYC
                </button>
                <button
                  onClick={() => handleVerify(selectedDoc.id, 'VERIFIED')}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve &amp; Verify KYC
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
