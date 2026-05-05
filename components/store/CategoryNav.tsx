'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

interface Props {
  items: string[]
  activeParam: 'category' | 'category1' | 'category2'
}

export default function CategoryNav({ items, activeParam }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  if (!items.length) return null

  const active = searchParams.get(activeParam)

  function navigate(href: string) {
    startTransition(() => router.push(href))
  }

  function buildHref(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    // Clear downstream params when going up a level
    if (activeParam === 'category') {
      params.delete('category1')
      params.delete('category2')
      if (params.get('category') === value) params.delete('category')
      else params.set('category', value)
    } else if (activeParam === 'category1') {
      params.delete('category2')
      if (params.get('category1') === value) params.delete('category1')
      else params.set('category1', value)
    } else {
      if (params.get('category2') === value) params.delete('category2')
      else params.set('category2', value)
    }
    return `/products?${params.toString()}`
  }

  function parentHref() {
    const params = new URLSearchParams(searchParams.toString())
    if (activeParam === 'category2') {
      params.delete('category1')
      params.delete('category2')
    } else {
      params.delete('category')
      params.delete('category1')
      params.delete('category2')
    }
    return `/products?${params.toString()}`
  }

  const parentLabel =
    activeParam === 'category2'
      ? searchParams.get('category1')
      : activeParam === 'category1'
      ? searchParams.get('category')
      : null

  return (
    <nav className={`space-y-0.5 transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      {parentLabel && (
        <button
          onClick={() => navigate(parentHref())}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-3"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {parentLabel}
        </button>
      )}
      {items.map((item) => (
        <button
          key={item}
          onClick={() => navigate(buildHref(item))}
          className={`block w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${
            active === item
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item}
        </button>
      ))}
    </nav>
  )
}
