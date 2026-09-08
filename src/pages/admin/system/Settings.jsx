import { useState } from 'react'
import { Settings2, Save, ShieldCheck, Clock, Building2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettings() {
  const [companyName, setCompanyName] = useState('Jample Life')
  const [tagline, setTagline] = useState('Rich World Healthy World')
  const [supportEmail, setSupportEmail] = useState('support@jamplelife.com')
  const [cutoffDay, setCutoffDay] = useState('MONDAY')
  const [minPayout, setMinPayout] = useState(100)
  const [maxPayout, setMaxPayout] = useState(100000)
  const [kycRequired, setKycRequired] = useState(true)

  const handleSave = (e) => {
    e.preventDefault()
    toast.success('System configuration updated successfully!')
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          System &amp; Business Rules Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure platform defaults, settlement schedules, payout limits, and legal compliance rules
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl space-y-6 text-xs">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Company Information</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Settlement &amp; Payout Rules</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cutoff Day</label>
              <select
                value={cutoffDay}
                onChange={(e) => setCutoffDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white focus:outline-none"
              >
                <option value="MONDAY">MONDAY (23:59 IST)</option>
                <option value="SUNDAY">SUNDAY</option>
                <option value="SATURDAY">SATURDAY</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Min Payout (₹)</label>
              <input
                type="number"
                value={minPayout}
                onChange={(e) => setMinPayout(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Payout (₹)</label>
              <input
                type="number"
                value={maxPayout}
                onChange={(e) => setMaxPayout(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="kyc-toggle"
              checked={kycRequired}
              onChange={(e) => setKycRequired(e.target.checked)}
              className="rounded text-jample-burgundy focus:ring-jample-burgundy"
            />
            <label htmlFor="kyc-toggle" className="font-bold text-slate-800">
              Require verified KYC before allowing member withdrawal requests
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white rounded-xl font-bold shadow-md transition"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}
