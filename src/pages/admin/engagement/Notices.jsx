import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Bell, AlertCircle, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { getNotices, createNotice } from '@/services/dbService'

export default function AdminNotices() {
  const [notices, setNotices] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    getNotices().then(setNotices).catch(() => setNotices([]))
  }, [])

  const handleAddNotice = async (e) => {
    e.preventDefault()
    if (!title || !content) return

    try {
      const newNotice = await createNotice({ title, content, category: 'GENERAL', is_active: true })
      setNotices(prev => [newNotice, ...prev])
      setTitle('')
      setContent('')
      setIsModalOpen(false)
      toast.success('Announcement broadcasted to all members!')
    } catch (err) {
      toast.error('Failed to create notice: ' + err.message)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Distributor Noticeboard &amp; Broadcasts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish official announcements, cycle closures, and leadership recognition bulletins
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-jample-burgundy text-white font-bold text-xs hover:bg-jample-burgundy/90 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Broadcast Announcement
        </button>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <div key={n.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-amber-50 text-amber-900 rounded-full font-bold text-[10px] border border-amber-200">
                {n.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">Published recently</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
          </div>
        ))}
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">Broadcast Notice</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Settlement Cutoff Update"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bulletin Content</label>
                <textarea
                  rows="4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter message visible to all members..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white rounded-xl font-bold shadow-md"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
