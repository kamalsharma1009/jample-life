import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, Calendar, Award, ShieldCheck, ChevronRight,
  Filter, Layers, ArrowUpRight, Sparkles, CheckCircle2, Download, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import { getSettlementPeriods, getLevelIncomeBreakdown } from '@/services/dbService'
import { useAuthStore } from '@/stores/authStore'
import StatusBadge from '@/components/shared/StatusBadge'

// Fallback level breakdown using commission_rules rates
const DEFAULT_LEVEL_BREAKDOWN = [
  { level: 1, rate: 10.0, members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
  { level: 2, rate: 8.0,  members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
  { level: 3, rate: 6.0,  members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
  { level: 4, rate: 4.0,  members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
  { level: 5, rate: 4.0,  members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
  { level: 6, rate: 4.0,  members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
  { level: 7, rate: 2.0,  members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
  { level: 8, rate: 2.0,  members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
  { level: 9, rate: 2.0,  members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
  { level: 10, rate: 1.0, members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
  { level: 11, rate: 1.0, members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
  { level: 12, rate: 1.0, members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
  { level: 13, rate: 1.0, members_count: 0, total_bv: 0, earned_amount: 0, qualified_count: 0 },
]

export default function IncomePage() {
  const { profile } = useAuthStore()
  const [settlements, setSettlements] = useState([])
  const [levelBreakdown, setLevelBreakdown] = useState(DEFAULT_LEVEL_BREAKDOWN)
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [settlementsData, levelsData] = await Promise.all([
          getSettlementPeriods(),
          getLevelIncomeBreakdown(),
        ])
        setSettlements(settlementsData)
        if (levelsData && levelsData.length > 0) {
          setLevelBreakdown(levelsData)
        }
        if (settlementsData.length > 0) {
          setSelectedPeriod(settlementsData[0].id)
        }
      } catch (err) {
        console.warn('[IncomePage] Failed to load income data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const currentSettlement = settlements.find(s => s.id === selectedPeriod) || settlements[0] || null

  // Chart data: Level breakdown
  const chartData = levelBreakdown.map(lvl => ({
    name: `L${lvl.level}`,
    rate: `${lvl.rate}%`,
    bv: lvl.total_bv || 0,
    earnings: lvl.earned_amount || 0,
  }))

  const totalLevelIncome = levelBreakdown.reduce((acc, curr) => acc + (curr.earned_amount || 0), 0)
  const totalLevelBv = levelBreakdown.reduce((acc, curr) => acc + (curr.total_bv || 0), 0)
  const totalTeamMembers = levelBreakdown.reduce((acc, curr) => acc + (curr.members_count || 0), 0)

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Commission &amp; Level Income
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your 13-level sponsor override earnings, weekly settlements, and director bonuses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/wallet"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-sm"
          >
            Go to Wallet Ledger
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          TOP SUMMARY METRICS
      ───────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-jample-burgundy" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Current Period
              </span>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {currentSettlement?.period_number || '—'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status: {currentSettlement?.status || 'N/A'}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Total Payout
              </span>
              <div className="text-2xl font-black text-jample-burgundy mt-2">
                {formatCurrency(currentSettlement?.total_payout || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {currentSettlement?.eligible_members || 0} eligible members
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Total Business Volume
              </span>
              <div className="text-2xl font-black text-amber-600 mt-2">
                {formatNumber(currentSettlement?.total_business || 0)} BV
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Period: {currentSettlement ? formatDate(currentSettlement.period_start) : '—'}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                My Total Earned
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-2">
                {formatCurrency(profile?.total_earned || 0)}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Lifetime commission credited
              </p>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              13-LEVEL CHART & SETTLEMENT CYCLE PICKER
          ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Level distribution chart */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">13-Level Commission Rates</h2>
                  <p className="text-xs text-slate-500">Commission percentage by generation level</p>
                </div>
                <div className="text-xs font-bold text-jample-burgundy bg-rose-50 px-3 py-1.5 rounded-xl">
                  Total Volume: {formatNumber(totalLevelBv)} BV
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'bv' ? `${formatNumber(value)} BV` : formatCurrency(value),
                        name === 'bv' ? 'Business Volume' : 'Commission Earned',
                      ]}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="bv" fill="#800020" radius={[6, 6, 0, 0]} name="bv" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Settlement Periods List */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Settlement Cycles</h3>
              {settlements.length === 0 ? (
                <p className="text-xs text-slate-400">No settlement periods found.</p>
              ) : (
                <div className="space-y-3">
                  {settlements.map((set) => (
                    <div
                      key={set.id}
                      onClick={() => setSelectedPeriod(set.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                        selectedPeriod === set.id
                          ? 'border-jample-burgundy bg-rose-50/40'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">{set.period_number}</span>
                        <StatusBadge status={set.status} />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500">
                          {formatDate(set.period_start)} - {formatDate(set.period_end)}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {formatCurrency(set.total_payout)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentSettlement && (
                <Link
                  to={`/income/${currentSettlement.id}`}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>View Full Statement Breakdown</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              13-LEVEL COMMISSION BREAKDOWN TABLE
          ───────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">13-Level Commission Rule Rate Table</h2>
                <p className="text-xs text-slate-500">Active distribution percentages per lineage generation tier</p>
              </div>
              <div className="text-xs font-mono text-slate-500">
                Cycle: <strong className="text-slate-900">{currentSettlement?.period_number || '—'}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Commission Rate</th>
                    <th className="py-3 px-4">Downline Members</th>
                    <th className="py-3 px-4">Qualified Volume</th>
                    <th className="py-3 px-4 text-right">Commission Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {levelBreakdown.map((lvl) => (
                    <tr key={lvl.level} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">
                          {lvl.level}
                        </span>
                        <span>{lvl.level === 1 ? 'Direct Sponsors (L1)' : `Level ${lvl.level}`}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-jample-burgundy">
                        {Number(lvl.rate).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4">
                        {lvl.members_count} members ({lvl.qualified_count} active)
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {formatNumber(lvl.total_bv)} BV
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatCurrency(lvl.earned_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50/50 font-bold text-slate-900">
                    <td className="py-4 px-4 text-sm font-black">Total (13 Levels)</td>
                    <td className="py-4 px-4 font-black text-jample-burgundy">46.0% Pool</td>
                    <td className="py-4 px-4">{totalTeamMembers} Members</td>
                    <td className="py-4 px-4">{formatNumber(totalLevelBv)} BV</td>
                    <td className="py-4 px-4 text-right text-base font-black text-emerald-600">
                      {formatCurrency(totalLevelIncome)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
