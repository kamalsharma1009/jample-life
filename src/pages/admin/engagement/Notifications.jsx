import { useState } from 'react'
import { Bell, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminNotifications() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetAudience, setTargetAudience] = useState('ALL')

  const handleSend = (e) => {
    e.preventDefault()
    if (!title || !message) return
    toast.success(`Push notification sent to ${targetAudience} members!`)
    setTitle('')
    setMessage('')
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Push Notifications Center
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Send direct real-time in-app alerts and announcements to distributor segments
        </p>
      </div>

      <form onSubmit={handleSend} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-xl space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white focus:outline-none"
          >
            <option value="ALL">All Registered Members</option>
            <option value="DIRECTORS">Qualified Directors Only</option>
            <option value="ACTIVE_THIS_CYCLE">Active PV Members Only</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Notification Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekly settlement released!"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Message Body</label>
          <textarea
            rows="3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter alert message..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Send Notification
        </button>
      </form>
    </div>
  )
}
