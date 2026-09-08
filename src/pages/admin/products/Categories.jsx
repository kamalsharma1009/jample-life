import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Edit3, Trash2, Layers, Search, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import StatusBadge from '@/components/shared/StatusBadge'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [loading, setLoading] = useState(true)

  const loadCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('display_order', { ascending: true })
      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Failed to load categories from Supabase:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCatName) return

    const slug = newCatName.toLowerCase().replace(/\s+/g, '-')
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert([{
          name: newCatName,
          slug,
          display_order: categories.length + 1,
          status: 'ACTIVE',
        }])
        .select()
        .single()

      if (error) throw error
      setCategories([...categories, data])
      setNewCatName('')
      setNewCatDesc('')
      setIsModalOpen(false)
      toast.success(`Category "${newCatName}" added directly to Supabase!`)
    } catch (err) {
      toast.error('Failed to add category: ' + err.message)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Product Categories
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize catalog groupings and product hierarchy
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-jample-burgundy text-white font-bold text-xs hover:bg-jample-burgundy/90 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-jample-burgundy flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{cat.description}</p>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>{cat.count || 0} Products</span>
              <span className="text-emerald-600 font-bold">● Active</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">Add New Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Organic Beverages"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short category description..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jample-burgundy"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white rounded-xl font-bold shadow-md transition"
                >
                  Save Category
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
