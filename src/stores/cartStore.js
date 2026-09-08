import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Zustand store for managing shopping cart state with local persistence.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // Array of { id, sku, name, slug, image_url, dp, mrp, pv, business_volume, quantity }

      // Add item to cart
      addItem: (product, quantity = 1) => {
        const { items } = get()
        const existingIndex = items.findIndex((i) => i.id === product.id || i.sku === product.sku)

        if (existingIndex > -1) {
          const updated = [...items]
          updated[existingIndex].quantity += quantity
          set({ items: updated })
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id || product.sku,
                sku: product.sku,
                name: product.name,
                slug: product.slug,
                image_url: product.image_url || null,
                dp: Number(product.dp || product.selling_price || product.mrp),
                mrp: Number(product.mrp || product.dp),
                pv: Number(product.pv || 0),
                business_volume: Number(product.business_volume || product.pv || 0),
                quantity: Math.max(1, quantity),
              },
            ],
          })
        }
      },

      // Update quantity of specific item
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        const updated = get().items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
        set({ items: updated })
      },

      // Remove single item
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) })
      },

      // Clear entire cart
      clearCart: () => {
        set({ items: [] })
      },

      // Computed totals
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.dp * item.quantity, 0)
      },

      getTotalMrp: () => {
        return get().items.reduce((total, item) => total + item.mrp * item.quantity, 0)
      },

      getTotalSavings: () => {
        const mrp = get().getTotalMrp()
        const subtotal = get().getSubtotal()
        return Math.max(0, mrp - subtotal)
      },

      getTotalBv: () => {
        return get().items.reduce(
          (total, item) => total + (item.business_volume || item.pv || 0) * item.quantity,
          0
        )
      },

      getTotalPv: () => {
        return get().items.reduce((total, item) => total + (item.pv || 0) * item.quantity, 0)
      },

      getShippingCost: () => {
        const subtotal = get().getSubtotal()
        if (subtotal === 0) return 0
        return subtotal >= 1000 ? 0 : 70 // Free shipping over ₹1000
      },

      getTotalAmount: () => {
        return get().getSubtotal() + get().getShippingCost()
      },
    }),
    {
      name: 'jample_cart_storage',
    }
  )
)
