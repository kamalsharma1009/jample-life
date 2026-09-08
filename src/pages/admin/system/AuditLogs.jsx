import { useState } from 'react'
import { ShieldCheck, Search, Filter, Clock, UserCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminAuditLogs() {
  const [logs] = useState([
    { id: 'log-1', admin_user: 'admin@jamplelife.com', action: 'COMMISSION_RATE_UPDATE', details: 'Updated Level 1 rate to 10.0% with Board justification', ip_address: '103.21.58.12', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 'log-2', admin_user: 'admin@jamplelife.com', action: 'SETTLEMENT_EXECUTE', details: 'Executed Weekly Settlement SET-2026-W35 batch release', ip_address: '103.21.58.12', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    { id: 'log-3', admin_user: 'admin@jamplelife.com', action: 'PAYOUT_APPROVAL', details: 'Approved bank transfer PAY-2026-0042 (₹9,000 net) with UTR ref', ip_address: '103.21.58.12', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
    { id: 'log-4', admin_user: 'admin@jamplelife.com', action: 'KYC_VERIFICATION', details: 'Verified documents for Kamal Verma (JL-2026-0088)', ip_address: '103.21.58.12', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString() },
  ])

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          System Audit Logs &amp; Security Trail
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable audit record of all administrative actions, commission adjustments, and payouts
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Account</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{formatDate(l.created_at)}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{l.admin_user}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono text-[10px] font-bold">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{l.details}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">{l.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
