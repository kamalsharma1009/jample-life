import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'
import {
  ShieldCheck, Award, Users, TrendingUp, ChevronDown, ChevronUp,
  Sparkles, Zap
} from 'lucide-react'
import { formatNumber, getRankDisplay, getInitials } from '@/lib/utils'

const RANK_THEMES = {
  CROWN_AMBASSADOR: {
    border: 'border-amber-400 ring-2 ring-amber-300/40 shadow-amber-500/10',
    headerBg: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    avatarBg: 'bg-amber-700 text-white',
  },
  DIAMOND_DIRECTOR: {
    border: 'border-violet-400 ring-2 ring-violet-300/40 shadow-violet-500/10',
    headerBg: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
    badge: 'bg-violet-100 text-violet-900 border-violet-300',
    avatarBg: 'bg-violet-700 text-white',
  },
  JAMPLE_DIRECTOR: {
    border: 'border-emerald-500 ring-2 ring-emerald-300/40 shadow-emerald-500/10',
    headerBg: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    avatarBg: 'bg-emerald-700 text-white',
  },
  RUBY_EXECUTIVE: {
    border: 'border-[#853953] ring-2 ring-[#853953]/30 shadow-rose-900/10',
    headerBg: 'bg-gradient-to-r from-[#853953] to-[#612D53] text-white',
    badge: 'bg-rose-100 text-rose-900 border-rose-200',
    avatarBg: 'bg-[#853953] text-white',
  },
  MEMBER: {
    border: 'border-slate-300 ring-1 ring-slate-200 shadow-slate-400/5',
    headerBg: 'bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    avatarBg: 'bg-[#853953] text-white',
  },
}

function MemberTreeNodeComponent({ data, selected }) {
  const { member, depth, hasChildren, childCount, isCollapsed, onToggleCollapse } = data
  const theme = RANK_THEMES[member.rank_code] || RANK_THEMES.MEMBER
  const isRoot = depth === 0
  const isQualified = (member.personal_pv || 0) >= 25

  return (
    <div
      className={`relative w-[300px] bg-white rounded-2xl shadow-md transition-all duration-200 border-2 select-none group ${
        theme.border
      } ${selected ? 'ring-4 ring-amber-400 shadow-2xl scale-[1.02]' : 'hover:shadow-xl hover:scale-[1.01]'}`}
    >
      {/* Top Handle for Incoming Connection */}
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3.5 !h-3.5 !bg-[#853953] !border-2 !border-white shadow-md"
        />
      )}

      {/* Card Header */}
      <div className={`px-4 py-3.5 rounded-t-[14px] flex items-center justify-between ${theme.headerBg}`}>
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar with status beacon */}
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-xs ${theme.avatarBg}`}>
              {getInitials(member.full_name)}
            </div>
            {isQualified && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white ring-1 ring-emerald-500 animate-pulse" />
            )}
          </div>

          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-black truncate text-white leading-tight">
              {member.full_name}
            </p>
            <p className="text-[10px] font-mono text-slate-300 mt-0.5 tracking-wider">
              {member.member_id}
            </p>
          </div>
        </div>

        {/* Level indicator pill */}
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-black/30 text-white border border-white/20 uppercase tracking-wide">
          {isRoot ? 'YOU' : `L${depth}`}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3 text-left bg-slate-50/60 rounded-b-[14px]">
        {/* Rank & Qualification Row */}
        <div className="flex items-center justify-between text-[11px]">
          <span className={`px-2.5 py-0.5 rounded-md font-extrabold text-[10px] border ${theme.badge}`}>
            {getRankDisplay(member.rank_code).name}
          </span>
          <span className={`font-bold flex items-center gap-1.5 ${
            isQualified ? 'text-emerald-700' : 'text-amber-600'
          }`}>
            <ShieldCheck size={13} />
            {isQualified ? 'Active (25+ PV)' : 'Inactive'}
          </span>
        </div>

        {/* Volume Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-white rounded-xl border border-slate-200/90 text-[11px] shadow-xs">
          <div className="p-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Personal PV</span>
            <span className="font-black text-slate-800 text-xs tabular-num">{member.personal_pv || 0} PV</span>
          </div>
          <div className="p-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Team Volume</span>
            <span className="font-black text-emerald-600 text-xs tabular-num">{formatNumber(member.team_bv || 0)} BV</span>
          </div>
          {data.mode === 'PLACEMENT' ? (
            <>
              <div className="pt-2 border-t border-slate-100 p-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Left Leg</span>
                <span className="font-bold text-slate-700 tabular-num">{formatNumber(member.left_bv || 0)} BV</span>
              </div>
              <div className="pt-2 border-t border-slate-100 p-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Right Leg</span>
                <span className="font-bold text-slate-700 tabular-num">{formatNumber(member.right_bv || 0)} BV</span>
              </div>
            </>
          ) : (
            <>
              <div className="pt-2 border-t border-slate-100 p-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Directs (L1)</span>
                <span className="font-bold text-slate-700 tabular-num">{member.direct_referrals_count || 0} Directs</span>
              </div>
              <div className="pt-2 border-t border-slate-100 p-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Downline</span>
                <span className="font-bold text-purple-700 tabular-num">{member.total_downline_count || 0} Total</span>
              </div>
            </>
          )}
        </div>

        {/* Expand / Collapse Action Footer */}
        {hasChildren && (
          <div className="pt-1 flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (data.onToggle) data.onToggle(member.id)
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              {isCollapsed ? (
                <>
                  <ChevronDown size={13} className="text-[#853953]" />
                  <span>Expand Subtree ({childCount} Directs)</span>
                </>
              ) : (
                <>
                  <ChevronUp size={13} className="text-slate-500" />
                  <span>Collapse Branch</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Handle for Outgoing Child Connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-[#853953] !border-2 !border-white shadow-md"
      />
    </div>
  )
}

export default memo(MemberTreeNodeComponent)
