'use client'
import { useRouter, useSearchParams } from 'next/navigation'

interface FilterOptions {
  categories: (string | null)[]
  brands: (string | null)[]
  genres: (string | null)[]
  activities: string[]
}

interface Props {
  options: FilterOptions
  active: Record<string, string | undefined>
}

export default function ProductFiltersPanel({ options, active }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/products?${params.toString()}`)
  }

  function clearAll() {
    router.push('/products')
  }

  const hasActive = Object.values(active).some(Boolean)

  return (
    <div className="space-y-6">
      {hasActive && (
        <button onClick={clearAll} className="text-xs text-red-500 hover:underline">
          Clear filters
        </button>
      )}

      <FilterSection title="Category">
        {options.categories.filter(Boolean).map((c) => (
          <FilterButton
            key={c}
            label={c!}
            active={active.category === c}
            onClick={() => applyFilter('category', c!)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Brand">
        {options.brands.filter(Boolean).map((b) => (
          <FilterButton
            key={b}
            label={b!}
            active={active.brand === b}
            onClick={() => applyFilter('brand', b!)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Activity">
        {options.activities.map((a) => (
          <FilterButton
            key={a}
            label={a}
            active={active.activity === a}
            onClick={() => applyFilter('activity', a)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Genre">
        {options.genres.filter(Boolean).map((g) => (
          <FilterButton
            key={g}
            label={g === 'M' ? 'Men' : g === 'F' ? 'Women' : 'Unisex'}
            active={active.genre === g}
            onClick={() => applyFilter('genre', g!)}
          />
        ))}
      </FilterSection>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left text-sm px-2 py-1 rounded transition ${
        active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )
}
