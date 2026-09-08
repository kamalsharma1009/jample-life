import { useState, useEffect } from 'react'
import { Package, Search, Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export default function AdminInventory() {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Failed to load inventory from Supabase:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleStockUpdate = async (id, delta) => {
    const currentProd = products.find(p => p.id === id)
    if (!currentProd) return
    const newStock = Math.max(0, (currentProd.stock_quantity || 0) + delta)

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', id)
      if (error) throw error

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock_quantity: newStock } : p))
      )
      toast.success(`Stock for ${currentProd.sku} updated to ${newStock} in Supabase!`)
    } catch (err) {
      toast.error('Failed to update stock: ' + err.message)
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Inventory &amp; Stock Levels
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor warehouse physical inventory and trigger restock updates
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stock by SKU or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Distributor DP</th>
                <th className="py-3 px-4">PV / BV</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                    <img src={p.image_url} alt={p.name} className="w-9 h-9 rounded-xl object-cover" />
                    <span>{p.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{p.sku}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(p.dp)}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600">{p.pv} PV ({p.business_volume} BV)</td>
                  <td className="py-3.5 px-4">
                    <span className={`font-black ${p.stock_quantity < 50 ? 'text-amber-600' : 'text-slate-900'}`}>
                      {p.stock_quantity} units
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {p.stock_quantity > 0 ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">In Stock</span>
                    ) : (
                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-bold text-[10px]">Out of Stock</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1 border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                      <button
                        onClick={() => handleStockUpdate(p.id, -10)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded-lg font-bold"
                        title="-10 Units"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => handleStockUpdate(p.id, 50)}
                        className="px-2.5 py-1 bg-jample-burgundy text-white hover:bg-jample-burgundy/90 rounded-lg font-bold text-[11px] shadow-sm"
                        title="+50 Units"
                      >
                        +50 Restock
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
