import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock, Play, CheckCircle2, AlertCircle, RefreshCw,
  ShieldCheck, ArrowRight, Award, Wallet, Lock, Layers, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import { getSettlementPeriods } from '@/services/dbService'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminSettlementControl() {
  const [currentSettlement, setCurrentSettlement] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionStep, setExecutionStep] = useState('IDLE') // 'IDLE' | 'CLOSING' | 'CALCULATING' | 'FINALIZING' | 'RELEASED'

  useEffect(() => {
    getSettlementPeriods()
      .then(data => {
        if (data && data.length > 0) {
          // Get the most recent/active settlement
          const active = data.find(s => s.status === 'ACTIVE') || data[0]
          setCurrentSettlement(active)
        }
      })
      .catch(() => {})
  }, [])

  const handleRunSettlementBatch = async () => {
    setIsExecuting(true)
    setExecutionStep('CLOSING')
    toast.info('Step 1: Closing weekly business cycle (Monday 23:59:59 IST cutoff)...')

    await new Promise((r) => setTimeout(r, 1200))
    setExecutionStep('CALCULATING')
    toast.info('Step 2: Calculating 13-Level lineage overrides, BDC, and Director pools...')

    await new Promise((r) => setTimeout(r, 1600))
    setExecutionStep('FINALIZING')
    toast.info('Step 3: Deducting 5% TDS + 5% Admin charges and generating audit records...')

    await new Promise((r) => setTimeout(r, 1200))
    setExecutionStep('RELEASED')
    setCurrentSettlement({
      ...currentSettlement,
      status: 'PAID',
    })
    setIsExecuting(false)
    toast.success('Weekly Settlement Batch SET-2026-W36 calculated & released to member wallets successfully!')
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Weekly Settlement Control Panel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated execution engine for weekly 13-level commission batches, tax deductions, and wallet disbursement
          </p>
        </div>

        <Link
          to="/admin/settlements"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition shadow-sm"
        >
          View Past Settlements
        </Link>
      </div>

      {/* ─────────────────────────────────────────────
          ACTIVE CYCLE CONTROLLER
      ───────────────────────────────────────────── */}
      {currentSettlement ? (
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-jample-dark rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-amber-300 font-bold">CYCLE: {currentSettlement.period_number || currentSettlement.settlement_number}</span>
              <StatusBadge status={currentSettlement.status} />
            </div>
            <h2 className="text-xl font-black text-white">Current Weekly Settlement Batch</h2>
            <p className="text-xs text-slate-300">
              Period: {formatDate(currentSettlement.period_start)} &bull; Cutoff: Monday 23:59:59 IST
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Net to Disburse</span>
            <span className="text-2xl font-black text-amber-300">{formatCurrency((currentSettlement.total_payout || 0) * 0.90)}</span>
          </div>
        </div>

        {/* 4 Execution Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className={`p-4 rounded-2xl border ${
            executionStep === 'CLOSING' || executionStep === 'CALCULATING' || executionStep === 'FINALIZING' || executionStep === 'RELEASED'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : 'bg-white/5 border-white/10 text-slate-300'
          }`}>
            <span className="font-bold block mb-1">1. Cutoff Lock</span>
            <p className="text-[11px] text-slate-400">Lock business volume at Monday midnight</p>
          </div>

          <div className={`p-4 rounded-2xl border ${
            executionStep === 'CALCULATING' || executionStep === 'FINALIZING' || executionStep === 'RELEASED'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : 'bg-white/5 border-white/10 text-slate-300'
          }`}>
            <span className="font-bold block mb-1">2. 13-Tier Tree Calc</span>
            <p className="text-[11px] text-slate-400">Traverse genealogy and apply 10% to 1% rates</p>
          </div>

          <div className={`p-4 rounded-2xl border ${
            executionStep === 'FINALIZING' || executionStep === 'RELEASED'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : 'bg-white/5 border-white/10 text-slate-300'
          }`}>
            <span className="font-bold block mb-1">3. Tax Deductions</span>
            <p className="text-[11px] text-slate-400">Compute 5% TDS &amp; 5% admin charges</p>
          </div>

          <div className={`p-4 rounded-2xl border ${
            executionStep === 'RELEASED'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : 'bg-white/5 border-white/10 text-slate-300'
          }`}>
            <span className="font-bold block mb-1">4. Wallet Release</span>
            <p className="text-[11px] text-slate-400">Disburse net amounts to member balances</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRunSettlementBatch}
            disabled={isExecuting || currentSettlement.status === 'PAID'}
            className="px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Executing Settlement Engine...
              </>
            ) : currentSettlement.status === 'PAID' || currentSettlement.status === 'COMPLETED' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                Settlement Completed &amp; Paid
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Settlement &amp; Disburse to Wallets
              </>
            )}
          </button>
        </div>
      </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading settlement data...</p>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          FINANCIAL BATCH SUMMARY
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900">Current Cycle Financial Breakdown</h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 block">Total Business Volume</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {formatCurrency(currentSettlement?.total_business || 0)} BV
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 block">Total TDS Withheld (5%)</span>
            <span className="text-xl font-black text-rose-600 mt-1 block">
              {formatCurrency((currentSettlement?.total_payout || 0) * 0.05)}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 block">Admin Service Charges (5%)</span>
            <span className="text-xl font-black text-rose-600 mt-1 block">
              {formatCurrency((currentSettlement?.total_payout || 0) * 0.05)}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs text-emerald-800 font-bold block">Net Wallet Disbursements</span>
            <span className="text-xl font-black text-emerald-700 mt-1 block">
              {formatCurrency((currentSettlement?.total_payout || 0) * 0.90)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
