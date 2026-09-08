import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Database, Check, Copy, AlertCircle, RefreshCw, Sparkles,
  ExternalLink, Server, Layers, ShieldCheck, X
} from 'lucide-react'
import { toast } from 'sonner'

export default function DatabaseSeedModal({ isOpen, onClose, onDataReloaded, dbSource }) {
  const [loading, setLoading] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)

  if (!isOpen) return null

  const handleSeed = async () => {
    setLoading(true)
    try {
      if (onDataReloaded) await onDataReloaded()
      toast.success('Live Supabase database synced successfully!')
      onClose()
    } catch (err) {
      toast.error('Sync error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopySqlInstructions = () => {
    const text = `-- Run this in Supabase SQL Editor:
-- File: supabase/MASTER_GENEALOGY_DATABASE_SEED.sql
-- Contains full public.profiles, public.genealogy, public.ranks and 15+ members across 4 levels.`
    navigator.clipboard.writeText(text)
    setCopiedSql(true)
    toast.success('SQL seed path copied! Run supabase/MASTER_GENEALOGY_DATABASE_SEED.sql in your Supabase SQL Editor.')
    setTimeout(() => setCopiedSql(false), 2500)
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#853953] text-white flex items-center justify-center shadow-md">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Database & Genealogy Manager</h3>
              <p className="text-xs text-slate-500">Live Supabase & relational schema controller</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Connection Status */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <Server size={14} className="text-slate-400" /> Database Connection:
            </span>
            <span className="font-mono font-bold text-slate-800">
              {dbSource === 'supabase' ? '🟢 Supabase PostgreSQL' : '🟡 Seed / Local DB'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <Layers size={14} className="text-slate-400" /> Endpoint:
            </span>
            <span className="font-mono text-[11px] text-slate-600 truncate max-w-[200px]">
              https://sjyupxaymxrlunlltnrz.supabase.co
            </span>
          </div>
        </div>

        {/* Action Explanation */}
        <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p>
            You can load the master dummy dataset directly into the database. This creates <strong>15+ real distributor profiles</strong> across <strong>4 generation levels</strong> with complete PV, team BV volumes, and Left/Right binary placements.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleSeed}
            disabled={loading}
            className="w-full py-3 px-4 bg-[#853953] hover:bg-[#9e4363] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Load Master Tree Data into Database
          </button>

          <button
            onClick={handleCopySqlInstructions}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {copiedSql ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            {copiedSql ? 'SQL Script Reference Copied' : 'Copy Master SQL File Path (for Supabase Editor)'}
          </button>
        </div>

        <div className="pt-1 text-center">
          <span className="text-[11px] text-slate-400">
            Master SQL file location: <code className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">supabase/MASTER_GENEALOGY_DATABASE_SEED.sql</code>
          </span>
        </div>

      </div>
    </div>,
    document.body
  )
}
