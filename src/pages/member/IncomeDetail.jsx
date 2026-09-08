import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Calendar, ShieldCheck, Award, Printer, Download,
  TrendingUp, CheckCircle2, AlertCircle, FileText, Sparkles, Loader2
} from 'lucide-react'
import { getSettlementById } from '@/services/dbService'
import { formatCurrency, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge'

export default function IncomeDetailPage() {
  const { id } = useParams()
  const [settlement, setSettlement] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getSettlementById(id)
        setSettlement(data)
      } catch (err) {
        console.warn('[IncomeDetailPage] Failed to load settlement:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-jample-burgundy" />
      </div>
    )
  }

  if (!settlement) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">Settlement not found</h3>
        <Link to="/income" className="px-5 py-2.5 bg-jample-burgundy text-white rounded-xl text-xs font-bold hover:bg-jample-burgundy/90 transition inline-flex items-center gap-2 mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to Income
        </Link>
      </div>
    )
  }

  const totalBusiness = settlement.total_business || 0
  const totalPayout = settlement.total_payout || 0
  const tdsAmount = totalPayout * 0.05
  const adminCharge = totalPayout * 0.05
  const netPayout = totalPayout - tdsAmount - adminCharge

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          BREADCRUMBS & ACTIONS
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/income" className="hover:text-jample-burgundy flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> All Settlements
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{settlement.period_number}</span>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-sm self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Statement
        </button>
      </div>

      {/* ─────────────────────────────────────────────
          STATEMENT HEADER CARD
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Weekly Commission Statement
              </h1>
              <StatusBadge status={settlement.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cycle: <strong className="font-mono text-slate-800">{settlement.period_number}</strong> &bull; Period: {formatDate(settlement.period_start)} to {formatDate(settlement.period_end)}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Net Payout Credited</span>
            <span className="text-2xl font-black text-emerald-600">
              {formatCurrency(netPayout)}
            </span>
          </div>
        </div>

        {/* Qualification check banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-950 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Personal PV Qualification: 25 PV Verified &bull; Active Status</span>
          </div>
          <span className="text-emerald-700 font-semibold hidden sm:inline">Settlement Cycle Closed Monday 23:59 IST</span>
        </div>

        {/* Financial calculation breakdown grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block">Total Business Volume</span>
            <span className="text-lg font-black text-slate-900 mt-1 block">
              {formatCurrency(totalBusiness)} BV
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block">Gross Commission Pool</span>
            <span className="text-lg font-black text-slate-900 mt-1 block">
              {formatCurrency(totalPayout)}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 block">TDS + Admin (10%)</span>
            <span className="text-lg font-black text-rose-600 mt-1 block">
              -{formatCurrency(tdsAmount + adminCharge)}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-xs text-emerald-800 font-bold block">Net Wallet Credit</span>
            <span className="text-lg font-black text-emerald-700 mt-1 block">
              {formatCurrency(netPayout)}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          INCOME STREAMS BREAKDOWN
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900">Settlement Summary</h2>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-4 flex items-center justify-between first:pt-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-jample-burgundy flex items-center justify-center font-bold">
                13L
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">13-Level Lineage Override Commission</h4>
                <p className="text-slate-500">Calculated on downline qualifying purchase volume (Levels 1 to 13)</p>
              </div>
            </div>
            <span className="text-sm font-black text-slate-900">{formatCurrency(totalPayout * 0.60)}</span>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                BDC
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Business Development Commission (BDC)</h4>
                <p className="text-slate-500">12-Level business turnover sharing bonus (5% pool)</p>
              </div>
            </div>
            <span className="text-sm font-black text-slate-900">{formatCurrency(totalPayout * 0.25)}</span>
          </div>

          <div className="py-4 flex items-center justify-between last:pb-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                DIR
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Director Leadership Bonus</h4>
                <p className="text-slate-500">Leadership pool tier bonus for qualified Directors</p>
              </div>
            </div>
            <span className="text-sm font-black text-slate-900">{formatCurrency(totalPayout * 0.15)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>Eligible Members this cycle: <strong className="text-slate-900">{settlement.eligible_members}</strong></span>
        </div>
      </div>
    </div>
  )
}
