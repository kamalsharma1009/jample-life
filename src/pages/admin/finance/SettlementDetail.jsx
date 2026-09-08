import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, ShieldCheck, Printer, CheckCircle2, Download, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getSettlementById } from '@/services/dbService'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminSettlementDetail() {
  const { id } = useParams()
  const [settlement, setSettlement] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettlementById(id)
      .then(setSettlement)
      .catch(() => setSettlement(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-jample-burgundy" />
      </div>
    )
  }

  if (!settlement) {
    return <div className="text-center py-20 text-slate-500">Settlement not found.</div>
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/admin/settlements" className="hover:text-jample-burgundy flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> All Settlements
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{settlement.period_number || settlement.settlement_number}</span>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-sm inline-flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" /> Print Batch Report
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-slate-400">{settlement.period_number || settlement.settlement_number}</span>
              <StatusBadge status={settlement.status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Settlement Batch Financial Statement</h1>
            <p className="text-xs text-slate-500">Cycle: {formatDate(settlement.period_start)} to {formatDate(settlement.period_end)}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Disbursed</span>
            <span className="text-2xl font-black text-emerald-600">{formatCurrency((settlement.total_payout || 0) * 0.90)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block">Total Business Volume</span>
            <span className="text-lg font-black text-slate-900 mt-1 block">{formatCurrency(settlement.total_business || 0)} BV</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block">Eligible Members</span>
            <span className="text-lg font-black text-slate-900 mt-1 block">{settlement.eligible_members || 0} members</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block">Total TDS Withheld (5%)</span>
            <span className="text-lg font-black text-rose-600 mt-1 block">-{formatCurrency((settlement.total_payout || 0) * 0.05)}</span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs text-emerald-800 font-bold block">Net Released to Members</span>
            <span className="text-lg font-black text-emerald-700 mt-1 block">{formatCurrency((settlement.total_payout || 0) * 0.90)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
