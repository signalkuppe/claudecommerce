'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import CartBadge from './CartBadge'
import type { MenuData } from '@/lib/menu'

const TOP_ITEMS = [
  { key: 'uomo',         label: 'Uomo',         href: '/products?genre=M' },
  { key: 'donna',        label: 'Donna',         href: '/products?genre=F' },
  { key: 'attrezzatura', label: 'Attrezzatura',  href: '/products?category=Attrezzatura' },
  { key: 'marchi',       label: 'Marchi',        href: '/products' },
  { key: 'sport',        label: 'Sport',         href: '/products' },
]

export default function StoreHeader({ menuData }: { menuData: MenuData }) {
  const [active, setActive] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function openPanel(key: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActive(key)
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setActive(null), 120)
  }

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  function closeAll() {
    setActive(null)
    setMobileOpen(false)
    setMobileExpanded(null)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Desktop bar */}
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-base font-semibold text-gray-900 tracking-tight shrink-0" onClick={closeAll}>
          ClaudeCommerce
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" onMouseLeave={scheduleClose}>
          {TOP_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onMouseEnter={() => openPanel(item.key)}
              onClick={closeAll}
              className={`px-3 py-2 text-sm rounded transition-colors ${
                active === item.key ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartBadge />
          {/* Hamburger */}
          <button
            className="md:hidden p-1 text-gray-600"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Desktop mega menu panel */}
      {active && (
        <div
          className="absolute left-0 right-0 top-full bg-white border-t border-gray-100 shadow-lg hidden md:block"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            {(active === 'uomo' || active === 'donna') && (
              <GenrePanel
                tree={active === 'uomo' ? menuData.uomo : menuData.donna}
                genre={active === 'uomo' ? 'M' : 'F'}
                onClose={() => setActive(null)}
              />
            )}
            {active === 'attrezzatura' && (
              <AttrezzaturaPanel data={menuData.attrezzatura} onClose={() => setActive(null)} />
            )}
            {active === 'marchi' && (
              <BrandsPanel brands={menuData.brands} onClose={() => setActive(null)} />
            )}
            {active === 'sport' && (
              <SportPanel sports={menuData.sports} onClose={() => setActive(null)} />
            )}
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white overflow-y-auto max-h-[80vh]">
          {TOP_ITEMS.map((item) => (
            <MobileSection
              key={item.key}
              label={item.label}
              href={item.href}
              expanded={mobileExpanded === item.key}
              onToggle={() => setMobileExpanded(mobileExpanded === item.key ? null : item.key)}
              onClose={closeAll}
            >
              {(item.key === 'uomo' || item.key === 'donna') && (
                <MobileGenreLinks
                  tree={item.key === 'uomo' ? menuData.uomo : menuData.donna}
                  genre={item.key === 'uomo' ? 'M' : 'F'}
                  onClose={closeAll}
                />
              )}
              {item.key === 'attrezzatura' && (
                <MobileAttrezzaturaLinks data={menuData.attrezzatura} onClose={closeAll} />
              )}
              {item.key === 'marchi' && (
                <MobileFlatLinks
                  items={menuData.brands.map((b) => ({ label: b, href: `/products?brand=${encodeURIComponent(b)}` }))}
                  onClose={closeAll}
                />
              )}
              {item.key === 'sport' && (
                <MobileFlatLinks
                  items={menuData.sports.map((s) => ({ label: s, href: `/products?activity=${encodeURIComponent(s)}` }))}
                  onClose={closeAll}
                />
              )}
            </MobileSection>
          ))}
        </div>
      )}
    </header>
  )
}

/* ── Desktop panels ── */

function GenrePanel({
  tree,
  genre,
  onClose,
}: {
  tree: Record<string, Record<string, string[]>>
  genre: string
  onClose: () => void
}) {
  const entries = Object.entries(tree)
  if (!entries.length) return <p className="text-sm text-gray-400">Nessuna categoria disponibile.</p>
  return (
    <div className="flex gap-12">
      {entries.map(([category, subs]) => (
        <div key={category}>
          <Link
            href={`/products?genre=${genre}&category=${encodeURIComponent(category)}`}
            onClick={onClose}
            className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors block mb-3"
          >
            {category}
          </Link>
          <div className="flex gap-10">
            {Object.entries(subs).map(([cat1, cat2s]) => (
              <div key={cat1}>
                <Link
                  href={`/products?genre=${genre}&category1=${encodeURIComponent(cat1)}`}
                  onClick={onClose}
                  className="text-sm font-medium text-gray-900 hover:text-gray-500 transition-colors block mb-2"
                >
                  {cat1}
                </Link>
                {cat2s.map((cat2) => (
                  <Link
                    key={cat2}
                    href={`/products?genre=${genre}&category1=${encodeURIComponent(cat1)}&category2=${encodeURIComponent(cat2)}`}
                    onClick={onClose}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors block mb-1"
                  >
                    {cat2}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AttrezzaturaPanel({
  data,
  onClose,
}: {
  data: Record<string, string[]>
  onClose: () => void
}) {
  const entries = Object.entries(data)
  if (!entries.length) return <p className="text-sm text-gray-400">Nessuna categoria disponibile.</p>
  return (
    <div className="flex gap-10">
      {entries.map(([cat1, cat2s]) => (
        <div key={cat1}>
          <Link
            href={`/products?category=Attrezzatura&category1=${encodeURIComponent(cat1)}`}
            onClick={onClose}
            className="text-sm font-medium text-gray-900 hover:text-gray-500 transition-colors block mb-2"
          >
            {cat1}
          </Link>
          {cat2s.map((cat2) => (
            <Link
              key={cat2}
              href={`/products?category=Attrezzatura&category1=${encodeURIComponent(cat1)}&category2=${encodeURIComponent(cat2)}`}
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors block mb-1"
            >
              {cat2}
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}

function BrandsPanel({ brands, onClose }: { brands: string[]; onClose: () => void }) {
  if (!brands.length) return <p className="text-sm text-gray-400">Nessun marchio disponibile.</p>
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2">
      {brands.map((brand) => (
        <Link
          key={brand}
          href={`/products?brand=${encodeURIComponent(brand)}`}
          onClick={onClose}
          className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
        >
          {brand}
        </Link>
      ))}
    </div>
  )
}

function SportPanel({ sports, onClose }: { sports: string[]; onClose: () => void }) {
  if (!sports.length) return <p className="text-sm text-gray-400">Nessuno sport disponibile.</p>
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2">
      {sports.map((sport) => (
        <Link
          key={sport}
          href={`/products?activity=${encodeURIComponent(sport)}`}
          onClick={onClose}
          className="text-sm text-gray-700 hover:text-gray-900 transition-colors capitalize"
        >
          {sport}
        </Link>
      ))}
    </div>
  )
}

/* ── Mobile sections ── */

function MobileSection({
  label,
  href,
  expanded,
  onToggle,
  onClose,
  children,
}: {
  label: string
  href: string
  expanded: boolean
  onToggle: () => void
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-100">
      <div className="flex items-center">
        <Link
          href={href}
          onClick={onClose}
          className="flex-1 px-6 py-4 text-sm font-medium text-gray-900"
        >
          {label}
        </Link>
        <button
          onClick={onToggle}
          className="px-4 py-4 text-gray-400"
          aria-label="Expand"
        >
          <svg
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {expanded && <div className="px-6 pb-4">{children}</div>}
    </div>
  )
}

function MobileGenreLinks({
  tree,
  genre,
  onClose,
}: {
  tree: Record<string, Record<string, string[]>>
  genre: string
  onClose: () => void
}) {
  return (
    <div className="space-y-4">
      {Object.entries(tree).map(([category, subs]) => (
        <div key={category}>
          <Link
            href={`/products?genre=${genre}&category=${encodeURIComponent(category)}`}
            onClick={onClose}
            className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors block mb-2"
          >
            {category}
          </Link>
          {Object.entries(subs).map(([cat1, cat2s]) => (
            <div key={cat1} className="mb-2">
              <Link
                href={`/products?genre=${genre}&category1=${encodeURIComponent(cat1)}`}
                onClick={onClose}
                className="text-sm font-medium text-gray-800 block mb-1"
              >
                {cat1}
              </Link>
              {cat2s.map((cat2) => (
                <Link
                  key={cat2}
                  href={`/products?genre=${genre}&category1=${encodeURIComponent(cat1)}&category2=${encodeURIComponent(cat2)}`}
                  onClick={onClose}
                  className="text-sm text-gray-500 block pl-3 mb-0.5"
                >
                  {cat2}
                </Link>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function MobileAttrezzaturaLinks({
  data,
  onClose,
}: {
  data: Record<string, string[]>
  onClose: () => void
}) {
  return (
    <div className="space-y-2">
      {Object.entries(data).map(([cat1, cat2s]) => (
        <div key={cat1}>
          <Link
            href={`/products?category=Attrezzatura&category1=${encodeURIComponent(cat1)}`}
            onClick={onClose}
            className="text-sm font-medium text-gray-800 block mb-1"
          >
            {cat1}
          </Link>
          {cat2s.map((cat2) => (
            <Link
              key={cat2}
              href={`/products?category=Attrezzatura&category1=${encodeURIComponent(cat1)}&category2=${encodeURIComponent(cat2)}`}
              onClick={onClose}
              className="text-sm text-gray-500 block pl-3 mb-0.5"
            >
              {cat2}
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}

function MobileFlatLinks({
  items,
  onClose,
}: {
  items: { label: string; href: string }[]
  onClose: () => void
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={onClose}
          className="text-sm text-gray-700 block capitalize"
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
