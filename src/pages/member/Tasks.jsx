import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Target, CheckCircle2, Clock, Trophy, Award, Sparkles, 
  ArrowRight, Users, ShoppingBag, ShieldCheck, Zap
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getSettlementPeriods } from '@/services/dbService'
import { formatDate } from '@/lib/utils'

export default function Tasks() {
  const { profile } = useAuthStore()
  const [cycleInfo, setCycleInfo] = useState('Current Weekly Cycle')

  useEffect(() => {
    async function loadCycle() {
      try {
        const periods = await getSettlementPeriods()
        if (periods && periods.length > 0) {
          const current = periods[0]
          setCycleInfo(`Cycle #${current.period_number || 'CURRENT'}: ${formatDate(current.period_start)} - ${formatDate(current.period_end)}`)
        }
      } catch (e) {
        console.warn('Could not load settlement periods for tasks:', e)
      }
    }
    loadCycle()
  }, [])

  const personalPv = Number(profile?.personal_pv) || 0
  const directReferrals = Number(profile?.direct_referrals_count) || 0
  const teamBv = Number(profile?.team_bv) || 0
  const isKycVerified = profile?.kyc_status === 'VERIFIED'
  const currentRank = (profile?.rank || 'MEMBER').toUpperCase()

  const tasks = [
    {
      id: 'task-1',
      category: 'WEEKLY_QUALIFICATION',
      title: 'Maintain Minimum 25 PV Personal Volume',
      description: 'Place personal repurchase orders totaling at least 25 PV (250 BV) before Monday 23:59 IST to unlock all 13 level commissions.',
      current: personalPv,
      target: 25,
      unit: 'PV',
      completed: personalPv >= 25,
      reward: 'Level 1-13 Commission Eligibility',
      link: '/shop',
      linkText: 'Order Products'
    },
    {
      id: 'task-2',
      category: 'GROWTH',
      title: 'Sponsor 2 Direct Associates This Month',
      description: 'Expand your frontline team by referring 2 new distributors with active initial product purchases.',
      current: directReferrals,
      target: 2,
      unit: 'Members',
      completed: directReferrals >= 2,
      reward: 'BDC Qualification + ₹500 Sponsor Bonus',
      link: '/referral',
      linkText: 'Share Referral Link'
    },
    {
      id: 'task-3',
      category: 'VOLUME',
      title: 'Achieve ₹10,000 Team Business Volume (BV)',
      description: 'Support your downline team members to reach 10,000 cumulative group BV during current cycle.',
      current: teamBv,
      target: 10000,
      unit: 'BV',
      completed: teamBv >= 10000,
      reward: 'Director Bonus Point + Rank Advancement',
      link: '/team',
      linkText: 'View Downline'
    },
    {
      id: 'task-4',
      category: 'COMPLIANCE',
      title: 'Complete Full KYC Verification',
      description: 'Submit PAN Card, Aadhaar Card and Bank Account details for instant payout clearance.',
      current: isKycVerified ? 1 : 0,
      target: 1,
      unit: 'Done',
      completed: isKycVerified,
      reward: 'Unlocks Bank Withdrawals',
      link: '/kyc',
      linkText: 'View KYC'
    }
  ]

  const rankRoadmap = [
    {
      rank: 'MEMBER',
      bvRequired: '0 BV',
      perks: 'Retail Margin (15-25%) + 13-Level Team Income',
      achieved: true
    },
    {
      rank: 'RUBY EXECUTIVE',
      bvRequired: '25,000 BV',
      perks: 'Level Income + 5% Global BDC Pool Share',
      achieved: teamBv >= 25000 || ['RUBY EXECUTIVE', 'DIAMOND DIRECTOR', 'CROWN AMBASSADOR'].includes(currentRank)
    },
    {
      rank: 'DIAMOND DIRECTOR',
      bvRequired: '100,000 BV',
      perks: '20% Global Director Bonus Pool + Leadership Retreat',
      achieved: teamBv >= 100000 || ['DIAMOND DIRECTOR', 'CROWN AMBASSADOR'].includes(currentRank)
    },
    {
      rank: 'CROWN AMBASSADOR',
      bvRequired: '500,000 BV',
      perks: 'Luxury Car Fund + Annual International Convention + Royalty',
      achieved: teamBv >= 500000 || ['CROWN AMBASSADOR'].includes(currentRank)
    }
  ]

  const completedCount = tasks.filter(t => t.completed).length
  const progressPercent = Math.round((completedCount / tasks.length) * 100)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Tasks & Rank Goals</h1>
        <p className="text-sm text-gray-500 mt-1">Track your weekly performance milestones, rank qualification tasks, and rewards</p>
      </div>

      {/* Progress Overview Card */}
      <div className="bg-gradient-to-r from-burgundy-900 via-darkPurple-900 to-burgundy-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 font-bold text-xs rounded-full border border-amber-400/30">
                {cycleInfo}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Cycle Target Completion</h2>
            <p className="text-xs text-gray-300">
              You have completed {completedCount} of {tasks.length} key business targets. Fulfill remaining goals to maximize weekly payouts.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-4 rounded-xl border border-white/10">
            <div className="w-14 h-14 rounded-full border-4 border-amber-400 flex items-center justify-center font-bold text-lg text-amber-300">
              {progressPercent}%
            </div>
            <div>
              <p className="text-xs text-gray-300">Current Payout Status</p>
              <p className={`text-sm font-bold flex items-center gap-1 mt-0.5 ${personalPv >= 25 ? 'text-emerald-400' : 'text-amber-300'}`}>
                <CheckCircle2 className="w-4 h-4" /> {personalPv >= 25 ? 'Qualified for Cut-Off' : '25 PV Required'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Tasks Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-burgundy-600" />
          Active Business Tasks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const pct = Math.min(100, Math.round((task.current / task.target) * 100))
            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  task.completed
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                        task.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-burgundy-100 text-burgundy-800'
                      }`}>
                        {task.category.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{task.title}</h3>
                  </div>

                  {task.completed ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500">Progress:</span>
                    <span className="text-gray-900">{task.current} / {task.target} {task.unit} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        task.completed ? 'bg-emerald-500' : 'bg-burgundy-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Reward & Link */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{task.reward}</span>
                  </div>

                  <Link
                    to={task.link}
                    className="text-burgundy-700 hover:text-burgundy-800 font-bold flex items-center gap-1 hover:underline"
                  >
                    {task.linkText}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rank Roadmap Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">Rank Advancement Roadmap</h2>
          </div>
          <span className="text-xs font-semibold text-gray-500">Tier Ladder</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rankRoadmap.map((r, idx) => (
            <div
              key={r.rank}
              className={`p-4 rounded-xl border relative space-y-2 ${
                r.achieved
                  ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/50'
                  : 'bg-gray-50/50 border-gray-200 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400">STAGE {idx + 1}</span>
                {r.achieved ? (
                  <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 text-[10px] font-bold rounded-full">
                    ACHIEVED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                    LOCKED
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-gray-900">{r.rank}</h3>
              <p className="text-xs font-mono font-semibold text-burgundy-700">{r.bvRequired}</p>
              <p className="text-xs text-gray-500 leading-snug">{r.perks}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
