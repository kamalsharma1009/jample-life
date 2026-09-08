import { useState } from 'react'
import { AlertCircle, ShieldAlert, CheckCircle2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

export default function AdminPlans() {
  const plans = [
    { code: 'PLAN_1', name: 'Jample Plan 1', enrollment: 2000, monthly: 100, principal: 50, profit: 50, duration: 40, total: 4000, status: 'INACTIVE' },
    { code: 'PLAN_2', name: 'Jample Plan 2', enrollment: 6000, monthly: 300, principal: 150, profit: 150, duration: 40, total: 12000, status: 'INACTIVE' },
    { code: 'PLAN_3', name: 'Jample Plan 3', enrollment: 10000, monthly: 500, principal: 250, profit: 250, duration: 40, total: 20000, status: 'INACTIVE' },
  ]

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Enrollment Plans &amp; Returns
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review enrollment package configurations and monthly distribution terms
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Compliance Advisory:</strong> Plan returns require formal legal review before activation in production. Do not market or describe as guaranteed fixed investment returns.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.code} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-400">{p.code}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                {p.status}
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900">{p.name}</h3>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Enrollment Amount:</span>
                <strong className="text-slate-900 font-bold">{formatCurrency(p.enrollment)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Monthly Return:</span>
                <strong className="text-slate-900 font-bold">{formatCurrency(p.monthly)} / mo</strong>
              </div>
              <div className="flex justify-between">
                <span>Monthly Principal / Profit:</span>
                <span>{formatCurrency(p.principal)} / {formatCurrency(p.profit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{p.duration} Months</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-jample-burgundy">
                <span>Total Return:</span>
                <span>{formatCurrency(p.total)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
