'use client'
import { useRef } from 'react'
import type { Variant, Product } from '@/lib/db/schema'
import type { ProductWithVariants } from '@/lib/products'
import ProductCard from './ProductCard'

interface FeaturedItem {
  variant: Variant
  product: Product
  productWithVariants: ProductWithVariants
}

export default function FeaturedCarousel({ items }: { items: FeaturedItem[] }) {
  const scrollRef = useRef<HTMLUListElement>(null)

  if (!items.length) return null

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector('li')?.offsetWidth ?? 260
    el.scrollBy({ left: dir === 'right' ? cardWidth * 2 : -cardWidth * 2, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        aria-label="Previous"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition hidden md:flex"
      >
        <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <ul
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map(({ variant, productWithVariants }) => (
          <li
            key={variant.id}
            className="snap-start shrink-0 w-[calc(50%-10px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)]"
          >
            <ProductCard product={productWithVariants} initialVariantId={variant.id} />
          </li>
        ))}
      </ul>

      <button
        onClick={() => scroll('right')}
        aria-label="Next"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition hidden md:flex"
      >
        <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
