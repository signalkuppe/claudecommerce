import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  variantId: string
  productId: string
  slug?: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  options: Record<string, string>
}

export interface CartNotification {
  name: string
  qty: number
  options: Record<string, string>
}

interface CartStore {
  items: CartItem[]
  notification: CartNotification | null
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, qty: number) => void
  clearCart: () => void
  clearNotification: () => void
  totalPrice: () => number
  totalItems: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      notification: null,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          return {
            notification: { name: item.name, qty: item.quantity, options: item.options },
            items: existing
              ? state.items.map((i) =>
                  i.variantId === item.variantId
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                )
              : [...state.items, item],
          }
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      updateQty: (variantId, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: qty } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      clearNotification: () => set({ notification: null }),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'claudecommerce-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
