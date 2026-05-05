import {
  getFilteredProducts,
  getCategoryNavData,
  getProductFacets,
  type ProductFilters,
} from '@/lib/products'
import ProductCard from '@/components/store/ProductCard'
import CategoryNav from '@/components/store/CategoryNav'
import ProductFilterBar from '@/components/store/ProductFilterBar'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const raw = await searchParams

  // Parse opt_* params into variantOptions
  const variantOptions: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith('opt_') && value) variantOptions[key.slice(4)] = value
  }

  const filters: ProductFilters = {
    category: raw.category,
    category1: raw.category1,
    category2: raw.category2,
    brand: raw.brand,
    activity: raw.activity,
    genre: raw.genre,
    minPrice: raw.minPrice,
    maxPrice: raw.maxPrice,
    variantOptions,
  }

  const navParams = {
    category: raw.category,
    category1: raw.category1,
    genre: raw.genre,
  }

  const facetParams = {
    category: raw.category,
    category1: raw.category1,
    category2: raw.category2,
    genre: raw.genre,
    activity: raw.activity,
  }

  const [productList, navData, facets] = await Promise.all([
    getFilteredProducts(filters),
    getCategoryNavData(navParams),
    getProductFacets(facetParams),
  ])

  // Derive page title from active navigation context
  const titleParts = [raw.category1 ?? raw.category, raw.category2].filter(Boolean)
  const title = titleParts.length ? titleParts.join(' › ') : 'All Products'

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-semibold text-gray-900 mb-10">{title}</h1>
      <div className="flex gap-10">
        {/* Left: category navigation */}
        <aside className="hidden lg:block w-48 shrink-0">
          <CategoryNav items={navData.items} activeParam={navData.activeParam} />
        </aside>

        {/* Right: filter bar + grid */}
        <div className="flex-1 min-w-0">
          <ProductFilterBar
            brands={facets.brands}
            priceRange={facets.priceRange}
            optionValues={facets.optionValues}
          />

          {productList.length === 0 ? (
            <p className="text-gray-400 text-sm">No products found.</p>
          ) : (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
                {productList.length} product{productList.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {productList.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
