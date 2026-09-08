import { useState, useEffect } from 'react'
import {
  TrendingUp, Save, ShieldCheck, AlertCircle, Edit3,
  CheckCircle2, History, RotateCcw, Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { getCommissionRules } from '@/services/dbService'
import { supabase } from '@/lib/supabase'

export default function AdminCommissionRules() {
  const [levelRules, setLevelRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [bdcRate, setBdcRate] = useState(5.0)
  const [directorPoolRate, setDirectorPoolRate] = useState(20.0)
  const [auditReason, setAuditReason] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const loadRules = async () => {
    try {
      setLoading(true)
      const data = await getCommissionRules()
      if (data && data.length > 0) {
        setLevelRules(data.map(d => ({ level: d.level, rate: Number(d.rate), name: `Generation Level ${d.level}` })))
      }
    } catch (e) {
      console.error('Error loading Supabase commission rules:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRules()
  }, [])

  const handleRateChange = (level, newRate) => {
    setLevelRules((prev) =>
      prev.map((r) => (r.level === level ? { ...r, rate: parseFloat(newRate) || 0 } : r))
    )
  }

  const handleSaveRules = async (e) => {
    e.preventDefault()
    if (!auditReason || auditReason.length < 5) {
      toast.error('Please enter a valid audit reason (min 5 chars) for changing compensation rates.')
      return
    }

    try {
      // Update each rule in Supabase
      await Promise.all(
        levelRules.map(r =>
          supabase
            .from('commission_rules')
            .update({ rate: r.rate })
            .eq('level', r.level)
        )
      )
      setIsEditing(false)
      setAuditReason('')
      toast.success('13-Level Commission Rules updated directly in Supabase!')
    } catch (err) {
      toast.error('Failed to update Supabase: ' + err.message)
    }
  }

  const totalPool = levelRules.reduce((acc, r) => acc + r.rate, 0)

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            13-Level Commission Rules &amp; Matrix Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure line-item commission percentages across all 13 sponsor lineage tiers with audit trailing
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
            isEditing
              ? 'bg-slate-200 text-slate-800'
              : 'bg-jample-burgundy text-white hover:bg-jample-burgundy/90'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          {isEditing ? 'Cancel Editing' : 'Edit Commission Rates'}
        </button>
      </div>

      {/* ─────────────────────────────────────────────
          RULE SUMMARY CARDS
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Level 1-13 Pool</span>
          <div className="text-3xl font-black text-jample-burgundy mt-2">{totalPool.toFixed(1)}%</div>
          <p className="text-xs text-slate-500 mt-1">Distributed across 13 generation tiers</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">BDC Turnover Sharing</span>
          <div className="text-3xl font-black text-amber-600 mt-2">{bdcRate.toFixed(1)}%</div>
          <p className="text-xs text-slate-500 mt-1">12-Level monthly business pool</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Director Leadership Pool</span>
          <div className="text-3xl font-black text-emerald-600 mt-2">{directorPoolRate.toFixed(1)}%</div>
          <p className="text-xs text-slate-500 mt-1">Split across 6 Director leadership ranks</p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          13-LEVEL RATES TABLE FORM
      ───────────────────────────────────────────── */}
      <form onSubmit={handleSaveRules} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Lineage Generation Rates (Tiers 1 to 13)</h2>
            <p className="text-xs text-slate-500">Commission is calculated on eligible BV points generated per cycle</p>
          </div>
          {isEditing && (
            <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold">
              Editing Mode Active
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Lineage Tier</th>
                <th className="py-3 px-4">Role / Relation</th>
                <th className="py-3 px-4">Commission Rate (%)</th>
                <th className="py-3 px-4">Calculation Basis</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {levelRules.map((lvl) => (
                <tr key={lvl.level} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    Level {lvl.level}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {lvl.level === 1 ? 'Direct Frontline Sponsor' : `Generation ${lvl.level} Downline`}
                  </td>
                  <td className="py-3.5 px-4">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 max-w-[120px]">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={lvl.rate}
                          onChange={(e) => handleRateChange(lvl.level, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                        />
                        <span className="font-bold text-slate-500">%</span>
                      </div>
                    ) : (
                      <span className="text-sm font-black text-jample-burgundy">{lvl.rate.toFixed(1)}%</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    Order BV &times; {lvl.rate}%
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold text-[10px] border border-emerald-200">
                      ACTIVE RULE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isEditing && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 pt-4">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Mandatory Audit Justification</span>
            </div>
            <input
              type="text"
              value={auditReason}
              onChange={(e) => setAuditReason(e.target.value)}
              placeholder="e.g. Board resolution Q3 compensation adjustment approved by management"
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-xs focus:outline-none"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-jample-burgundy hover:bg-jample-burgundy/90 text-white text-xs font-bold shadow-md"
              >
                Save &amp; Apply Rule Updates
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
