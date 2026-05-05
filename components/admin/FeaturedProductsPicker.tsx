'use client'
import { useState, useTransition } from 'react'
import Image from 'next/image'
import type { Variant, Product } from '@/lib/db/schema'

interface VariantWithProduct {
  variant: Variant
  product: Product
}

const MAX = 8

export default function FeaturedProductsPicker({
  all,
  initialIds,
}: {
  all: VariantWithProduct[]
  initialIds: string[]
}) {
  const [selected, setSelected] = useState<string[]>(initialIds.slice(0, MAX))
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filtered = query.trim()
    ? all.filter(({ product, variant }) => {
        const q = query.toLowerCase()
        return (
          product.name.toLowerCase().includes(q) ||
          (product.brand ?? '').toLowerCase().includes(q) ||
          Object.values((variant.options as Record<string, string>) ?? {}).some((v) =>
            v.toLowerCase().includes(q)
          )
        )
      })
    : all

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX ? [...prev, id] : prev
    )
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'featured_variant_ids', value: JSON.stringify(selected) }),
      })
      setSaved(true)
    })
  }

  const selectedItems = selected
    .map((id) => all.find((r) => r.variant.id === id))
    .filter((r): r is VariantWithProduct => r !== undefined)

  return (
    <div className="space-y-6">
      {/* Current selection */}
      <div>
        <p className="text-xs text-gray-500 mb-3">
          {selected.length}/{MAX} selected
        </p>
        {selectedItems.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {selectedItems.map(({ variant, product }) => {
              const imageUrl = variant.imageUrl ?? product.imageUrl
              const opts = Object.values((variant.options as Record<string, string>) ?? {}).join(
                ' · '
              )
              return (
                <li
                  key={variant.id}
                  className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2"
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 relative shrink-0">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    {opts && <p className="text-xs text-gray-400 truncate">{opts}</p>}
                  </div>
                  <button
                    onClick={() => toggle(variant.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition"
                  >
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 mb-4">No variants selected yet.</p>
        )}
      </div>

      {/* Search + picker */}
      <div>
        <input
          type="text"
          placeholder="Search variants…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <div className="border border-gray-100 rounded-lg overflow-hidden max-h-72 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 px-3 py-4 text-center">No results.</p>
          )}
          {filtered.map(({ variant, product }) => {
            const imageUrl = variant.imageUrl ?? product.imageUrl
            const opts = Object.values((variant.options as Record<string, string>) ?? {}).join(
              ' · '
            )
            const isSelected = selected.includes(variant.id)
            const isDisabled = !isSelected && selected.length >= MAX
            return (
              <button
                key={variant.id}
                onClick={() => toggle(variant.id)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition ${
                  isSelected
                    ? 'bg-gray-900 text-white'
                    : isDisabled
                    ? 'opacity-40 cursor-not-allowed bg-white'
                    : 'hover:bg-gray-50 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-md overflow-hidden bg-gray-200 relative shrink-0">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-base">
                      📦
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {product.name}
                  </p>
                  {opts && (
                    <p className={`text-xs truncate ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                      {opts}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <svg className="h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
      >
        {isPending ? 'Saving…' : saved ? 'Saved!' : 'Save selection'}
      </button>
    </div>
  )
}
