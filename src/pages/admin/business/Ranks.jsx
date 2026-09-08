import { useState } from 'react'
import { Award, ShieldCheck, Edit3, Save, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminRanks() {
  const [ranks, setRanks] = useState([
    { code: 'MEMBER', name: 'Member', order: 1, bonus: 0.0, qualification: 'Default entry tier upon enrollment' },
    { code: 'JAMPLE_DIRECTOR', name: 'Jample Director', order: 2, bonus: 10.0, qualification: 'Personal 50 PV + 5,000 Team BV' },
    { code: 'MARKETING_DIRECTOR', name: 'Marketing Director', order: 3, bonus: 5.0, qualification: '3 Direct Jample Directors + 20,000 Team BV' },
    { code: 'BUSINESS_DIRECTOR', name: 'Business Director', order: 4, bonus: 2.0, qualification: '2 Marketing Directors + 50,000 Team BV' },
    { code: 'GOLD_DIRECTOR', name: 'Gold Director', order: 5, bonus: 1.5, qualification: '2 Business Directors + 1,00,000 Team BV' },
    { code: 'PLATINUM_DIRECTOR', name: 'Platinum Director', order: 6, bonus: 1.0, qualification: '2 Gold Directors + 2,50,000 Team BV' },
    { code: 'DIAMOND_DIRECTOR', name: 'Diamond Director', order: 7, bonus: 0.5, qualification: '2 Platinum Directors + 5,00,000 Team BV' },
  ])

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          7-Tier Leadership Ranks &amp; Bonus Percentages
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Leadership progression hierarchy and company turnover profit-sharing pool allocations
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Rank Code &amp; Title</th>
                <th className="py-3 px-4">Leadership Pool Share (%)</th>
                <th className="py-3 px-4">Qualification Criteria</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {ranks.map((r) => (
                <tr key={r.code} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{r.order}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{r.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-amber-600 text-sm">
                    +{r.bonus.toFixed(1)}% Pool
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {r.qualification}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold text-[10px] border border-emerald-200">
                      ACTIVE
                    </span>
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
