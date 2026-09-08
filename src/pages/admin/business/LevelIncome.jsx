import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Layers, CheckCircle2, Award, ChevronRight } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { getLevelIncomeBreakdown } from '@/services/dbService'

const DEFAULT_LEVELS = [
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

export default function AdminLevelIncome() {
  const [levels, setLevels] = useState(DEFAULT_LEVELS)

  useEffect(() => {
    getLevelIncomeBreakdown()
      .then(data => { if (data && data.length > 0) setLevels(data) })
      .catch(() => {})
  }, [])
  const totalBv = levels.reduce((acc, l) => acc + l.total_bv, 0)
  const totalPayout = levels.reduce((acc, l) => acc + l.earned_amount, 0)

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Level Income Performance &amp; Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global breakdown of 13-level sponsor override payouts across the distributor network
          </p>
        </div>

        <Link
          to="/admin/commission-rules"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-jample-burgundy text-white font-bold text-xs hover:bg-jample-burgundy/90 transition shadow-sm self-start sm:self-auto"
        >
          Configure Commission Rates
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Level Payout</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">{formatCurrency(totalPayout)}</div>
          <p className="text-xs text-slate-500 mt-1">Paid to qualified sponsors</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Eligible Business Volume</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{formatNumber(totalBv)} BV</div>
          <p className="text-xs text-slate-500 mt-1">Across active product sales</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Distribution Tiers</span>
          <div className="text-2xl font-black text-jample-burgundy mt-2">13 Levels Active</div>
          <p className="text-xs text-slate-500 mt-1">Pool percentage: 46.0% Total</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900">Current Generation Tier Breakdown</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Commission %</th>
                <th className="py-3 px-4">Active Members</th>
                <th className="py-3 px-4">Generated BV</th>
                <th className="py-3 px-4 text-right">Disbursed Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {levels.map((lvl) => (
                <tr key={lvl.level} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {lvl.level === 1 ? 'Level 1 (Direct)' : `Level ${lvl.level}`}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-jample-burgundy">
                    {lvl.rate.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-semibold">
                    {lvl.members_count} distributors
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
          </table>
        </div>
      </div>
    </div>
  )
}
