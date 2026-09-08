import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Play, CheckCircle2, ChevronRight, Download, Calendar, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getSettlementPeriods } from '@/services/dbService'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminSettlements() {
  const [settlements, setSettlements] = useState([])

  useEffect(() => {
    getSettlementPeriods().then(setSettlements).catch(() => setSettlements([]))
  }, [])

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Weekly Settlement Batches
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical record of all weekly Monday settlement runs and wallet disbursements
          </p>
        </div>

        <Link
          to="/admin/settlements/control"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-jample-burgundy text-white font-bold text-xs hover:bg-jample-burgundy/90 transition shadow-sm self-start sm:self-auto"
        >
          <Play className="w-4 h-4" />
          Open Settlement Controller
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Settlement Batch</th>
                <th className="py-3 px-4">Cycle Period</th>
                <th className="py-3 px-4">Gross Income</th>
                <th className="py-3 px-4">TDS (5%)</th>
                <th className="py-3 px-4">Admin (5%)</th>
                <th className="py-3 px-4">Net Disbursed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {settlements.map((set) => (
                <tr key={set.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {set.period_number || set.settlement_number}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {formatDate(set.period_start)} - {formatDate(set.period_end)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatCurrency(set.total_business || set.gross_amount || 0)}
                  </td>
                  <td className="py-3.5 px-4 text-rose-600 font-medium">
                    -{formatCurrency((set.total_payout || 0) * 0.05)}
                  </td>
                  <td className="py-3.5 px-4 text-rose-600 font-medium">
                    -{formatCurrency((set.total_payout || 0) * 0.05)}
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-600">
                    {formatCurrency((set.total_payout || set.net_payout || 0) * 0.90)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={set.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/admin/settlements/${set.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition inline-flex items-center gap-1"
                    >
                      Breakdown <ChevronRight className="w-3.5 h-3.5" />
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
