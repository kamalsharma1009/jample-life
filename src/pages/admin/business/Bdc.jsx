import { useState } from 'react'
import { Award, ShieldCheck, AlertCircle, Save } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

export default function AdminBdc() {
  const [bdcRate, setBdcRate] = useState(5.0)
  const [durationMonths, setDurationMonths] = useState(20)
  const [minimumLevels, setMinimumLevels] = useState(12)
  const [isActive, setIsActive] = useState(true)

  const handleSave = (e) => {
    e.preventDefault()
    toast.success('BDC business configuration updated!')
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Business Development Commission (BDC)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure 12-level business turnover profit-sharing pool parameters
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Business Rule Note:</strong> BDC entitles qualifiers to 5% of turnover across 12-level business for up to 20 months. Ensure Marketing Director qualification criteria is verified before activation.
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl">
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Turnover Pool Share (%)</label>
              <input
                type="number"
                step="0.1"
                value={bdcRate}
                onChange={(e) => setBdcRate(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration (Months)</label>
              <input
                type="number"
                value={durationMonths}
                onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Minimum Qualifying Generation Depth</label>
            <input
              type="number"
              value={minimumLevels}
              onChange={(e) => setMinimumLevels(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default is 12 levels deep business turnover</p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="bdc-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-jample-burgundy focus:ring-jample-burgundy"
            />
            <label htmlFor="bdc-active" className="font-bold text-slate-800">
              Enable BDC calculation in weekly settlement engine
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  )
}
