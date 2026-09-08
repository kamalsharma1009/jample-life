import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Share2, Copy, Check, MessageSquare, QrCode, Sparkles,
  Users, CheckCircle2, Award, ArrowRight, ArrowUpRight, Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatNumber, formatDate, getRankDisplay } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import StatusBadge from '@/components/shared/StatusBadge'

export default function ReferralPage() {
  const { profile } = useAuthStore()
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [directMembers, setDirectMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const memberId = profile?.member_id || ''
  const referralCode = profile?.referral_code || memberId
  const referralUrl = `${window.location.origin}/register?ref=${referralCode}`

  useEffect(() => {
    async function loadDirects() {
      try {
        setLoading(true)
        const [profilesRes, genRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('role', 'MEMBER'),
          supabase.from('genealogy').select('*'),
        ])

        if (profilesRes.data && genRes.data) {
          const genMap = new Map(genRes.data.map(g => [g.member_id, g]))
          // If profile id exists, find direct sponsor matches
          const directs = profilesRes.data
            .filter(p => {
              const g = genMap.get(p.id)
              if (profile?.id) {
                return (g && g.sponsor_id === profile.id) || (p.sponsor_id === profile.id)
              }
              return false
            })
            .map(p => ({
              ...p,
              level: 1,
              team_bv: Number(p.team_bv || 0),
            }))
          setDirectMembers(directs)
        }
      } catch (err) {
        console.error('Error fetching direct referrals from Supabase:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDirects()
  }, [profile?.id])

  const totalDirectBv = directMembers.reduce((acc, m) => acc + (m.team_bv || 0), 0)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopiedLink(true)
    toast.success('Referral link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopiedCode(true)
    toast.success('Referral code copied!')
    setTimeout(() => setCopiedCode(false), 2500)
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Join my team at Jample Life — "Rich World Healthy World"! Build wealth with premium Ayurvedic wellness products & a powerful 13-level direct selling compensation system.\n\nRegister using my sponsor link:\n${referralUrl}\n\nSponsor Code: ${referralCode}`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Referral &amp; Sponsor Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grow your direct Level 1 team, share recruitment links, and earn 10% direct override commissions
          </p>
        </div>

        <button
          onClick={handleWhatsAppShare}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-sm self-start sm:self-auto"
        >
          <MessageSquare className="w-4 h-4" />
          Share on WhatsApp
        </button>
      </div>

      {/* ─────────────────────────────────────────────
          REFERRAL CODE & LINK CARD
      ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-jample-dark via-jample-purple to-jample-burgundy rounded-3xl p-6 sm:p-10 text-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="lg:col-span-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            10.0% Direct Level 1 Commission on all sponsor purchases
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Invite New Members &amp; Accelerate Your Team Volume
          </h2>

          {/* Referral link box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200">Your Shareable Sponsor Link</label>
            <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-2xl border border-white/20">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="w-full bg-transparent px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Referral code quick box */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs text-slate-300 font-medium">Sponsor Code:</span>
            <span className="font-mono text-base font-black text-amber-300 bg-white/10 px-3 py-1 rounded-xl border border-white/20">
              {referralCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-1"
            >
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* QR Code Presentation Box */}
        <div className="lg:col-span-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center text-white space-y-4 shadow-lg">
          <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl shadow-inner flex items-center justify-center">
            {/* Embedded QR Code simulation */}
            <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-2">
              <QrCode className="w-16 h-16 text-amber-400 mb-1" />
              <span className="text-[9px] font-mono text-slate-300 font-bold">SCAN TO JOIN</span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Offline &amp; Stage QR</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">Let new recruits scan directly with their phone</p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          DIRECT SPONSORS LIST (LEVEL 1)
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Directly Sponsored Members ({directMembers.length})</h2>
            <p className="text-xs text-slate-500">Your frontline Level 1 team generating 10% direct commissions</p>
          </div>

          <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
            Total Direct Volume: {formatNumber(totalDirectBv)} BV
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Member ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Personal PV</th>
                <th className="py-3 px-4">Team Volume</th>
                <th className="py-3 px-4">Their Directs</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {directMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {m.member_id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {m.full_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {getRankDisplay(m.rank).name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {m.personal_pv} PV
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    {formatNumber(m.team_bv)} BV
                  </td>
                  <td className="py-3.5 px-4 font-semibold">
                    {m.direct_referrals} members
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {formatDate(m.joined_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <StatusBadge status={m.status} />
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
