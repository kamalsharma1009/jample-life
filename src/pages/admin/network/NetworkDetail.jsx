import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, GitBranch, Users, Award, ShieldCheck, ChevronRight,
  Edit3, CheckCircle2, UserCheck, Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { formatNumber, formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminNetworkDetail() {
  const { id } = useParams()
  const [network, setNetwork] = useState(null)
  const [networkMembers, setNetworkMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const isUuid = id && id.includes('-') && id.length >= 32
        const query = supabase.from('networks').select('*, profiles:root_member_id(full_name, member_id)')
        if (isUuid) {
          query.eq('id', id)
        } else {
          query.eq('network_code', id)
        }

        const { data: net } = await query.maybeSingle()
        if (net) {
          setNetwork({
            ...net,
            leader_name: net.profiles?.full_name || 'Network Leader',
          })
        }

        const { data: members } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'MEMBER')
          .order('joined_at', { ascending: true })

        if (members) {
          setNetworkMembers(members)
        }
      } catch (err) {
        console.error('Error fetching network details from Supabase:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-bold">Loading network details from Supabase...</div>
  }

  if (!network) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-base font-bold text-slate-700">Network not found in Supabase.</p>
        <Link to="/admin/networks" className="text-xs font-bold text-[#853953] hover:underline">
          Return to Networks
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          BREADCRUMBS & HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/admin/networks" className="hover:text-jample-burgundy flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> All Network Branches
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{network.network_name}</span>
        </div>

        <StatusBadge status={network.status} />
      </div>

      {/* ─────────────────────────────────────────────
          NETWORK OVERVIEW CARD
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-slate-400">{network.network_code}</span>
            <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Active Branch
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">{network.network_name}</h1>
          <p className="text-xs text-slate-500">
            Regional Division Head: <strong className="text-slate-900">{network.leader_name}</strong>
          </p>
        </div>

        <div className="lg:col-span-4 grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <span className="text-slate-400 text-xs block">Distributors</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">{networkMembers.length} Members</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <span className="text-slate-400 text-xs block">Total Volume</span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">{formatNumber(network.total_volume_bv)} BV</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          NETWORK MEMBERS ROSTER
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Branch Members &amp; Leaders</h2>
          <span className="text-xs text-slate-500">{networkMembers.length} Active in Network</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role in Branch</th>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Personal PV</th>
                <th className="py-3 px-4">Team BV</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {networkMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{m.full_name}</div>
                    <div className="font-mono text-[11px] text-slate-400">{m.member_id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      m.network_role === 'LEADER'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {m.network_role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-amber-700">
                    {m.rank_code}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {m.personal_pv} PV
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    {formatNumber(m.team_bv)} BV
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/admin/members/${m.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                    >
                      Inspect
                    </Link>
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
