import { useState } from 'react'
import { GraduationCap, Award, CheckCircle2, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminEducation() {
  const [eduRate, setEduRate] = useState(6.0)

  const handleSave = (e) => {
    e.preventDefault()
    toast.success('Education Commission settings saved!')
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Education &amp; Training Commission
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure leadership training and mentoring commission incentives
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-xl space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Education Pool Percentage (%)</label>
          <input
            type="number"
            step="0.1"
            value={eduRate}
            onChange={(e) => setEduRate(parseFloat(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none"
          />
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white rounded-xl font-bold shadow-sm transition"
        >
          Save Education Settings
        </button>
      </div>
    </div>
  )
}
