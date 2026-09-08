import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  GitBranch, Plus, Search, Users, Award, ShieldCheck,
  ChevronRight, X, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { formatNumber, formatDate } from '@/lib/utils'
import { getNetworks } from '@/services/dbService'
import { createNetworkSchema } from '@/lib/validations'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminNetworks() {
  const [networks, setNetworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getNetworks()
      setNetworks(data)
    } catch (err) {
      console.error('Failed to load networks from Supabase:', err)
      toast.error('Could not load networks from Supabase')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createNetworkSchema),
  })

  const onCreateNetwork = (data) => {
    setIsSubmitting(true)
    setTimeout(() => {
      const newNet = {
        id: `net-${Date.now()}`,
        network_code: data.network_code,
        network_name: data.network_name,
        leader_name: 'Unassigned Leader',
        leader_id: null,
        total_members: 0,
        total_volume_bv: 0,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      }

      setNetworks([...networks, newNet])
      setIsSubmitting(false)
      setIsModalOpen(false)
      reset()
      toast.success(`Network "${newNet.network_name}" created successfully!`)
    }, 800)
  }

  const filteredNetworks = networks.filter((n) =>
    n.network_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.network_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.leader_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Distributor Network Branches
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize regional distributor clusters, assign team leaders, and monitor volume generation
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-jample-burgundy text-white font-bold text-xs hover:bg-jample-burgundy/90 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Network Branch
        </button>
      </div>

      {/* ─────────────────────────────────────────────
          NETWORKS GRID
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredNetworks.map((net) => (
          <div
            key={net.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-bold text-slate-400">{net.network_code}</span>
                <StatusBadge status={net.status} />
              </div>

              <h3 className="text-lg font-black text-slate-900 line-clamp-1">{net.network_name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Branch Leader: <strong className="text-slate-800">{net.leader_name}</strong>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <span className="text-slate-400 block text-[11px]">Distributors</span>
                <span className="font-black text-slate-900 text-sm">{net.total_members} Members</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <span className="text-slate-400 block text-[11px]">Total Volume</span>
                <span className="font-black text-emerald-600 text-sm">{formatNumber(net.total_volume_bv)} BV</span>
              </div>
            </div>

            <Link
              to={`/admin/networks/${net.id}`}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <span>Manage Branch &amp; Leaders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────
          CREATE NETWORK MODAL
      ───────────────────────────────────────────── */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">New Network Branch</h3>
                <p className="text-xs text-slate-500">Create a regional organizational network division</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreateNetwork)} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Network Division Name</label>
                <input
                  type="text"
                  {...register('network_name')}
                  placeholder="e.g. South India Titans"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                />
                {errors.network_name && <p className="text-rose-600 mt-1">{errors.network_name.message}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Branch Code</label>
                <input
                  type="text"
                  {...register('network_code')}
                  placeholder="e.g. NET_SOUTH_04"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy uppercase font-mono"
                />
                {errors.network_code && <p className="text-rose-600 mt-1">{errors.network_code.message}</p>}
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
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Branch'}
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
