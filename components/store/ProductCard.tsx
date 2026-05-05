'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ProductWithVariants } from '@/lib/products'
import { getDiscountedPrice } from '@/lib/products'
import { colorToHex } from '@/lib/colors'
import type { Variant } from '@/lib/db/schema'

function getColorVariants(variants: Variant[]): { color: string; hex: string; variant: Variant }[] {
  const seen = new Set<string>()
  const result: { color: string; hex: string; variant: Variant }[] = []
  for (const v of variants) {
    const opts = v.options as Record<string, string>
    const color = opts?.color
    if (!color || seen.has(color)) continue
    const hex = colorToHex(color)
    if (!hex) continue
    seen.add(color)
    result.push({ color, hex, variant: v })
  }
  return result
}

export default function ProductCard({
  product,
  initialVariantId,
}: {
  product: ProductWithVariants
  initialVariantId?: string
}) {
  const defaultVariant =
    (initialVariantId && product.variants.find((v) => v.id === initialVariantId)) ||
    product.variants.find((v) => v.isDefault) ||
    product.variants[0]
  const [selected, setSelected] = useState(defaultVariant)

  const imageUrl =
    selected?.imageUrl ??
    product.variants.find((v) => v.imageUrl)?.imageUrl ??
    product.imageUrl

  const price = selected?.price
  const discountPercent = selected?.discountPercent ?? null
  const finalPrice = price ? getDiscountedPrice(price, discountPercent) : null

  const colorVariants = getColorVariants(product.variants)
  const selectedColor = (selected?.options as Record<string, string>)?.color
  const outOfStock = selected?.stock === 0

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square bg-gray-100 overflow-hidden mb-3 relative rounded-lg">
          {imageUrl ? (
            <Image src={imageUrl} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {outOfStock ? (
            <span className="absolute top-2 left-2 bg-gray-400 text-white text-xs px-2 py-0.5 rounded">
              Out of stock
            </span>
          ) : discountPercent ? (
            <span className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-0.5 rounded">
              -{discountPercent}%
            </span>
          ) : null}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{product.brand}</p>
          <h3 className="text-sm text-gray-900 group-hover:text-gray-500 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
          {finalPrice !== null && (
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-sm font-medium text-gray-900">€{finalPrice.toFixed(2)}</span>
              {discountPercent && price ? (
                <span className="text-xs text-gray-400 line-through">
                  €{parseFloat(price).toFixed(2)}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </Link>

      {colorVariants.length > 1 && (
        <div className="flex gap-1.5 mt-2">
          {colorVariants.map(({ color, hex, variant }) => (
            <button
              key={color}
              title={color}
              onClick={() => setSelected(variant)}
              className="w-4 h-4 rounded-full border transition-transform hover:scale-110"
              style={{
                backgroundColor: hex,
                borderColor: selectedColor === color ? '#111827' : '#d1d5db',
                outline: selectedColor === color ? '2px solid #111827' : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
