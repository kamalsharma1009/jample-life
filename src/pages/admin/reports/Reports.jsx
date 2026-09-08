import { useState } from 'react'
import { FileText, Download, Calendar, BarChart3, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminReports() {
  const reports = [
    { title: 'Weekly Settlement Payout Statement (CSV)', desc: '13-level commission, TDS deduction, and member bank account distribution export', type: 'FINANCE' },
    { title: 'TDS Withholding & Tax Filing Report (Section 194H)', desc: 'Quarterly distributor PAN-linked tax deductions for statutory compliance', type: 'TAX' },
    { title: 'Product Sales & BV Allocation Summary', desc: 'SKU wise sales volume, gross margins, and credited point volumes', type: 'COMMERCE' },
    { title: 'Genealogy Lineage Tree Census', desc: 'Member downline depths, direct sponsor counts, and rank promotions', type: 'NETWORK' },
  ]

  const handleExport = (name) => {
    toast.success(`Exporting "${name}" report as CSV download...`)
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Executive Reports &amp; Financial Exports
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Download CSV and Excel audits for compliance, accounting, and MLM volume analysis
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {reports.map((r, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                {r.type}
              </span>
              <h3 className="text-base font-bold text-slate-900">{r.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
            </div>

            <button
              onClick={() => handleExport(r.title)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" /> Export Report (CSV)
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
