'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Product, Variant } from '@/lib/db/schema'
import { useCart } from '@/lib/cart'
import { getDiscountedPrice } from '@/lib/products'
import { colorToHex } from '@/lib/colors'

export default function ProductDetail({
  product,
  variants,
}: {
  product: Product
  variants: Variant[]
}) {
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0]
  const [selected, setSelected] = useState(defaultVariant)
  const [qty, setQty] = useState(1)
  const addItem = useCart((s) => s.addItem)
  const cartItems = useCart((s) => s.items)

  const inCart = cartItems.find((i) => i.variantId === selected.id)?.quantity ?? 0
  const availableStock = selected.stock === null ? Infinity : selected.stock
  const outOfStock = availableStock === 0
  const maxQty = Math.max(0, (availableStock === Infinity ? 99 : availableStock) - inCart)
  const canAdd = !outOfStock && maxQty > 0

  // reset qty when variant changes
  useEffect(() => { setQty(1) }, [selected.id])

  const optionKeys = [
    ...new Set(variants.flatMap((v) => Object.keys(v.options as Record<string, string>))),
  ]

  const finalPrice = getDiscountedPrice(selected.price, selected.discountPercent)
  const imageUrl = selected.imageUrl ?? product.imageUrl

  function handleAddToCart() {
    addItem({
      variantId: selected.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: finalPrice,
      quantity: qty,
      imageUrl: imageUrl ?? undefined,
      options: selected.options as Record<string, string>,
    })
    setQty(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
          {imageUrl ? (
            <Image src={imageUrl} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-semibold">€{finalPrice.toFixed(2)}</span>
            {selected.discountPercent ? (
              <>
                <span className="text-lg text-gray-400 line-through">
                  €{parseFloat(selected.price).toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-0.5 rounded">
                  -{selected.discountPercent}%
                </span>
              </>
            ) : null}
          </div>

          {product.description && (
            <p className="text-gray-600 mb-6">{product.description}</p>
          )}

          {optionKeys.map((key) => {
            const values = [
              ...new Set(
                variants
                  .map((v) => (v.options as Record<string, string>)[key])
                  .filter(Boolean)
              ),
            ]
            if (!values.length) return null
            const selectedValue = (selected.options as Record<string, string>)[key]

            return (
              <div key={key} className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2 capitalize">{key}</p>
                <div className="flex flex-wrap gap-2">
                  {values.map((v) => {
                    const currentOptions = selected.options as Record<string, string>
                    const desired = { ...currentOptions, [key]: v }
                    const matchingVariant = variants.find((vr) => {
                      const opts = vr.options as Record<string, string>
                      return Object.entries(desired).every(([k, val]) => opts[k] === val)
                    }) ?? variants.find((vr) => (vr.options as Record<string, string>)[key] === v)
                    const hex = key === 'color' ? colorToHex(v) : null
                    const isSelected = selectedValue === v
                    if (hex) {
                      return (
                        <button
                          key={v}
                          title={v}
                          onClick={() => matchingVariant && setSelected(matchingVariant)}
                          disabled={!matchingVariant}
                          className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: hex,
                            borderColor: isSelected ? '#111827' : '#d1d5db',
                            outline: isSelected ? '2px solid #111827' : 'none',
                            outlineOffset: '2px',
                          }}
                        />
                      )
                    }
                    return (
                      <button
                        key={v}
                        onClick={() => matchingVariant && setSelected(matchingVariant)}
                        disabled={!matchingVariant}
                        className={`px-4 py-2 text-sm border rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed ${
                          isSelected
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 text-gray-700 hover:border-gray-500'
                        }`}
                      >
                        {v}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {selected.stock !== null && selected.stock > 0 && selected.stock <= 5 && (
            <p className="text-sm text-amber-600 mt-4">Only {selected.stock} left in stock</p>
          )}

          <div className="flex gap-3 mt-6">
            {/* Qty selector */}
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="px-3 py-4 text-gray-600 hover:bg-gray-50 transition disabled:opacity-30"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                className="px-3 py-4 text-gray-600 hover:bg-gray-50 transition disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!canAdd}
              className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {outOfStock ? 'Out of stock' : !canAdd ? 'Max quantity reached' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
