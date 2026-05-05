'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, useTransition } from 'react'
import { colorToHex } from '@/lib/colors'

interface Props {
  brands: string[]
  priceRange: { min: number; max: number }
  optionValues: Record<string, string[]>
}

export default function ProductFilterBar({ brands, priceRange, optionValues }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeBrand = searchParams.get('brand') ?? ''
  const activeOptions: Record<string, string> = {}
  for (const key of Object.keys(optionValues)) {
    const v = searchParams.get(`opt_${key}`)
    if (v) activeOptions[key] = v
  }

  const urlMin = Number(searchParams.get('minPrice') ?? priceRange.min)
  const urlMax = Number(searchParams.get('maxPrice') ?? priceRange.max)

  const [sliderMin, setSliderMin] = useState(urlMin)
  const [sliderMax, setSliderMax] = useState(urlMax)

  useEffect(() => {
    setSliderMin(Number(searchParams.get('minPrice') ?? priceRange.min))
    setSliderMax(Number(searchParams.get('maxPrice') ?? priceRange.max))
  }, [searchParams, priceRange.min, priceRange.max])

  function push(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') params.delete(key)
    else params.set(key, value)
    startTransition(() => router.push(`/products?${params.toString()}`))
  }

  function applyPrice(min: number, max: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (min > priceRange.min) params.set('minPrice', String(min))
    else params.delete('minPrice')
    if (max < priceRange.max) params.set('maxPrice', String(max))
    else params.delete('maxPrice')
    startTransition(() => router.push(`/products?${params.toString()}`))
  }

  const hasFilters =
    activeBrand ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice') ||
    Object.keys(activeOptions).length > 0

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('brand')
    params.delete('minPrice')
    params.delete('maxPrice')
    for (const key of Object.keys(optionValues)) params.delete(`opt_${key}`)
    startTransition(() => router.push(`/products?${params.toString()}`))
  }

  const isEmpty = !brands.length && !Object.keys(optionValues).length && !priceRange.max

  if (isEmpty) return null

  const colors = optionValues['color'] ?? []
  const sizes = optionValues['size'] ?? []
  const otherOptions = Object.entries(optionValues).filter(([k]) => k !== 'color' && k !== 'size')

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-3 pb-5 mb-6 border-b border-gray-100 transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      {brands.length > 0 && (
        <FilterSelect
          label="Brand"
          value={activeBrand}
          onChange={(v) => push('brand', v)}
          options={brands}
        />
      )}

      {priceRange.max > priceRange.min && (
        <PriceSlider
          min={priceRange.min}
          max={priceRange.max}
          valueMin={sliderMin}
          valueMax={sliderMax}
          onChange={(min, max) => {
            setSliderMin(min)
            setSliderMax(max)
          }}
          onCommit={applyPrice}
        />
      )}

      {colors.length > 0 && (
        <ColorSelect
          values={colors}
          active={activeOptions['color'] ?? ''}
          onChange={(v) => push('opt_color', v)}
        />
      )}

      {sizes.length > 0 && (
        <FilterSelect
          label="Size"
          value={activeOptions['size'] ?? ''}
          onChange={(v) => push('opt_size', v)}
          options={sizes}
        />
      )}

      {otherOptions.map(([key, values]) => (
        <FilterSelect
          key={key}
          label={key.charAt(0).toUpperCase() + key.slice(1)}
          value={activeOptions[key] ?? ''}
          onChange={(v) => push(`opt_${key}`, v)}
          options={values}
        />
      ))}

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}

/* ── Price slider ── */

function PriceSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  onCommit,
}: {
  min: number
  max: number
  valueMin: number
  valueMax: number
  onChange: (min: number, max: number) => void
  onCommit: (min: number, max: number) => void
}) {
  const range = max - min || 1
  const minPct = ((valueMin - min) / range) * 100
  const maxPct = ((valueMax - min) / range) * 100

  function handleMin(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(Number(e.target.value), valueMax - 1)
    onChange(v, valueMax)
  }
  function handleMax(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.max(Number(e.target.value), valueMin + 1)
    onChange(valueMin, v)
  }
  function commit() {
    onCommit(valueMin, valueMax)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-400 shrink-0">Price</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-10 text-right">€{valueMin}</span>
        <div className="relative w-28 h-5 flex items-center">
          {/* Track */}
          <div className="absolute inset-x-0 h-1 rounded-full bg-gray-200">
            <div
              className="absolute h-full rounded-full bg-gray-900"
              style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
            />
          </div>
          {/* Thumbs (visual only) */}
          <div
            className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-gray-900 -translate-x-1/2 pointer-events-none shadow-sm"
            style={{ left: `${minPct}%` }}
          />
          <div
            className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-gray-900 -translate-x-1/2 pointer-events-none shadow-sm"
            style={{ left: `${maxPct}%` }}
          />
          {/* Min input */}
          <input
            type="range" min={min} max={max} value={valueMin}
            onChange={handleMin} onMouseUp={commit} onTouchEnd={commit}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ zIndex: valueMin >= valueMax - 1 ? 5 : 3 }}
          />
          {/* Max input */}
          <input
            type="range" min={min} max={max} value={valueMax}
            onChange={handleMax} onMouseUp={commit} onTouchEnd={commit}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ zIndex: 4 }}
          />
        </div>
        <span className="text-xs text-gray-500 w-10">€{valueMax}</span>
      </div>
    </div>
  )
}

/* ── Color select ── */

function ColorSelect({
  values,
  active,
  onChange,
}: {
  values: string[]
  active: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const activeHex = active ? colorToHex(active) : null

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <span className="text-xs font-medium text-gray-400 shrink-0">Color</span>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-md transition-colors ${
          active ? 'border-gray-900 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
        }`}
      >
        {activeHex && (
          <span className="w-3 h-3 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: activeHex }} />
        )}
        <span>{active || 'All'}</span>
        <svg className={`h-3 w-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-6 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-32">
          {active && (
            <button
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
            >
              All colors
            </button>
          )}
          {values.map((v) => {
            const hex = colorToHex(v)
            return (
              <button
                key={v}
                onClick={() => { onChange(v); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              >
                <span
                  className="w-4 h-4 rounded-full border border-gray-200 shrink-0"
                  style={{ backgroundColor: hex ?? '#e5e7eb' }}
                />
                <span className="flex-1 text-left capitalize">{v}</span>
                {active === v && (
                  <svg className="h-3 w-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Generic select ── */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-400 shrink-0">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`text-xs border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer transition-colors ${
          value ? 'border-gray-900 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
        }`}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}
