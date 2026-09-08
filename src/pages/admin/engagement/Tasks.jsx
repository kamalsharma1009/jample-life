import { useState } from 'react'
import { CheckSquare, Plus, Award, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminTasks() {
  const [tasks] = useState([
    { id: 't-1', title: 'Achieve 25 Personal PV this cycle', reward: '50 Bonus BV', type: 'PURCHASE', status: 'ACTIVE' },
    { id: 't-2', title: 'Sponsor 2 Direct Members this month', reward: '₹500 Direct Cash Bonus', type: 'REFERRAL', status: 'ACTIVE' },
    { id: 't-3', title: 'Complete KYC verification and Bank binding', reward: '10 Wallet Points', type: 'PROFILE', status: 'ACTIVE' },
  ])

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Member Engagement Tasks &amp; Rewards
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Incentivize member activation with custom volume and recruitment goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tasks.map((t) => (
          <div key={t.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px]">
                {t.type}
              </span>
              <span className="text-emerald-600 font-bold text-xs">● Active</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-bold">
              Reward: {t.reward}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
