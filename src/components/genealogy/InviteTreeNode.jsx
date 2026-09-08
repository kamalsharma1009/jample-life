import React, { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { UserPlus, Copy, Check, Share2, Sparkles, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

function InviteTreeNode({ data }) {
  const [copied, setCopied] = useState(false)
  const code = data.referralCode || 'JL-MEMBER'
  const inviteUrl = `${window.location.origin}/register?ref=${code}`

  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    toast.success('Referral link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (e) => {
    e.stopPropagation()
    const text = `Join my Jample Life direct distributor network! Register with code ${code}: ${inviteUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="relative w-[300px] bg-gradient-to-b from-white to-rose-50/30 rounded-2xl shadow-md border-2 border-dashed border-[#853953]/40 p-5 text-center transition-all duration-200 hover:shadow-xl hover:border-[#853953] select-none">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#853953] !border-2 !border-white shadow-xs"
      />

      <div className="w-12 h-12 mx-auto rounded-2xl bg-[#853953]/10 border border-[#853953]/20 flex items-center justify-center text-[#853953] mb-3 shadow-xs">
        <UserPlus size={22} />
      </div>

      <div className="space-y-1 mb-3.5">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#853953]/10 text-[#853953] text-[10px] font-extrabold uppercase tracking-wider">
          <Sparkles size={11} />
          <span>Next Distributor (L1)</span>
        </div>
        <h4 className="text-sm font-black text-slate-900">Start Your Downline</h4>
        <p className="text-xs text-slate-500 leading-relaxed max-w-[240px] mx-auto">
          Share your referral link with new partners to start earning 13-level commissions.
        </p>
      </div>

      <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 mb-3 shadow-xs">
        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Your Referral Code</span>
        <span className="font-mono text-xs font-black text-[#853953] tracking-widest">{code}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleCopy}
          className="w-full py-2 px-3 rounded-xl bg-[#853953] hover:bg-[#9e4363] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy Link'}</span>
        </button>

        <button
          onClick={handleShare}
          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95"
        >
          <Share2 size={14} />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  )
}

export default memo(InviteTreeNode)
