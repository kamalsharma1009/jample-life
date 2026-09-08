import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ShieldCheck, CheckCircle2, XCircle, AlertCircle, Eye,
  Search, Filter, UserCheck, X
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminKyc() {
  const [members, setMembers] = useState([])
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
      if (error) throw error
      setMembers(data || [])
    } catch (err) {
      console.error('Failed to load members for KYC from Supabase:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  const handleVerify = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ kyc_status: newStatus })
        .eq('id', id)
      if (error) throw error

      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, kyc_status: newStatus } : m))
      )
      setSelectedDoc(null)
      toast.success(`KYC status updated to ${newStatus} in Supabase!`)
    } catch (err) {
      toast.error('Failed to update KYC: ' + err.message)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          KYC Compliance Verification Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify government ID documents and bank account proofs for statutory compliance
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Submitted Documents</th>
                <th className="py-3 px-4">KYC Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {members.map((m) => (
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
                    {m.city}, {m.state}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-700">
                      Aadhaar + PAN Card + Cheque
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={m.kyc_status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedDoc(m)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px]"
                      >
                        Inspect Docs
                      </button>
                      {m.kyc_status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleVerify(m.id, 'VERIFIED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDoc && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">KYC Document Inspection</h3>
                <p className="text-xs text-slate-500">{selectedDoc.full_name} ({selectedDoc.member_id})</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p><strong>Identity Document:</strong> PAN Card (XXXXX9284F)</p>
                <p><strong>Address Document:</strong> Aadhaar Card (XXXX-XXXX-4829)</p>
                <p><strong>Bank Verification:</strong> Cancelled Cheque / Passbook Copy</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleVerify(selectedDoc.id, 'REJECTED')}
                  className="flex-1 py-3 bg-rose-50 text-rose-700 font-bold rounded-xl hover:bg-rose-100 transition"
                >
                  Reject KYC
                </button>
                <button
                  onClick={() => handleVerify(selectedDoc.id, 'VERIFIED')}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow"
                >
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
