import { useState } from 'react'
import { Award, ShieldCheck, Save, CheckCircle2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function AdminDirectorBonus() {
  const [totalPoolPercentage, setTotalPoolPercentage] = useState(20.0)

  const handleSave = (e) => {
    e.preventDefault()
    toast.success('Director leadership pool settings saved!')
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Director Leadership Bonus Pool
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure total revenue profit-sharing pool split across Director rank tiers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Director Pool</span>
          <div className="text-3xl font-black text-amber-600 mt-2">{totalPoolPercentage}%</div>
          <p className="text-xs text-slate-500 mt-1">Of total company monthly turnover</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Qualified Directors</span>
          <div className="text-3xl font-black text-emerald-600 mt-2">12 Leaders</div>
          <p className="text-xs text-slate-500 mt-1">Eligible this settlement cycle</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Pool Value</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{formatCurrency(296000)}</div>
          <p className="text-xs text-slate-500 mt-1">To be distributed Tuesday</p>
        </div>
      </div>
    </div>
  )
}
