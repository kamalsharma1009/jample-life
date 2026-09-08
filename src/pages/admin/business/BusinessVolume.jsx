import { useState } from 'react'
import { Award, Zap, TrendingUp, BarChart3, Save } from 'lucide-react'
import { toast } from 'sonner'
import { formatNumber } from '@/lib/utils'

export default function AdminBusinessVolume() {
  const [pvConversionRate, setPvConversionRate] = useState(10) // 1 PV = 10 BV

  const handleSave = (e) => {
    e.preventDefault()
    toast.success('Business Volume ratio updated!')
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Business Volume (BV) &amp; PV Engine Rules
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure Point Volume (PV) to Business Volume (BV) conversion ratios and qualification thresholds
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Default PV to BV Ratio</span>
          <div className="text-3xl font-black text-jample-burgundy mt-2">1 PV = 10 BV</div>
          <p className="text-xs text-slate-500 mt-1">1 BV = ₹1 Commission Calculation Base</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Qualification Threshold</span>
          <div className="text-3xl font-black text-emerald-600 mt-2">25 PV (250 BV)</div>
          <p className="text-xs text-slate-500 mt-1">Personal order required per cycle</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Director Threshold</span>
          <div className="text-3xl font-black text-amber-600 mt-2">50 PV (500 BV)</div>
          <p className="text-xs text-slate-500 mt-1">Leadership qualification</p>
        </div>
      </div>
    </div>
  )
}
