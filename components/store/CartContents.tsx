'use client'
import { useCart } from '@/lib/cart'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CartContents() {
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (data.url) router.push(data.url)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/products" className="text-sm underline">
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <ul className="divide-y divide-gray-100 mb-8">
        {items.map((item) => {
          const productHref = item.slug ? `/products/${item.slug}` : null
          return (
            <li key={item.variantId} className="py-5 flex gap-4">
              {/* Image — linked to product when slug is available */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                {productHref ? (
                  <Link href={productHref} className="block w-full h-full">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                    )}
                  </Link>
                ) : item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {productHref ? (
                  <Link href={productHref} className="font-medium hover:underline line-clamp-1">
                    {item.name}
                  </Link>
                ) : (
                  <p className="font-medium line-clamp-1">{item.name}</p>
                )}
                <p className="text-sm text-gray-400 mt-0.5">
                  {Object.entries(item.options)
                    .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                    .join(' · ')}
                </p>

                <div className="flex items-center gap-4 mt-2">
                  {/* Qty stepper */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item.variantId, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1 text-gray-500 hover:bg-gray-50 transition text-sm disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.variantId, item.quantity + 1)}
                      className="px-2.5 py-1 text-gray-500 hover:bg-gray-50 transition text-sm"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-xs text-gray-400 hover:text-red-500 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <p className="font-semibold text-sm shrink-0">
                €{(item.price * item.quantity).toFixed(2)}
              </p>
            </li>
          )
        })}
      </ul>

      <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-lg font-bold">Total: €{totalPrice().toFixed(2)}</p>
          <button
            onClick={() => { if (confirm('Empty your cart?')) clearCart() }}
            className="text-xs text-gray-400 hover:text-red-500 transition"
          >
            Empty cart
          </button>
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-700 transition disabled:opacity-50"
        >
          {loading ? 'Redirecting…' : 'Proceed to checkout'}
        </button>
      </div>
    </div>
  )
}
