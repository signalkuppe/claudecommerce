import { getDb } from '@/lib/db'
import { products, variants } from '@/lib/db/schema'
import { eq, and, sql, arrayContains, count, inArray, gt, exists } from 'drizzle-orm'
import type { Product, Variant } from '@/lib/db/schema'

export type { Product, Variant }

export interface ProductWithVariants extends Product {
  variants: Variant[]
}

export interface ProductFilters {
  category?: string
  category1?: string
  category2?: string
  brand?: string
  activity?: string
  genre?: string
  minPrice?: string
  maxPrice?: string
  variantOptions?: Record<string, string>
}

async function attachVariants(rows: Product[]): Promise<ProductWithVariants[]> {
  if (!rows.length) return []
  const ids = rows.map((p) => p.id)

  const variantsByProduct: Record<string, Variant[]> = {}
  for (const id of ids) variantsByProduct[id] = []

  const allVars = await getDb()
    .select()
    .from(variants)
    .orderBy(variants.productId, variants.id)

  for (const v of allVars) {
    if (variantsByProduct[v.productId] !== undefined) {
      variantsByProduct[v.productId].push(v)
    }
  }

  return rows.map((p) => ({ ...p, variants: variantsByProduct[p.id] ?? [] }))
}

export async function getFilteredProducts(filters: ProductFilters): Promise<ProductWithVariants[]> {
  const db = getDb()
  const conditions = [eq(products.published, true)]

  if (filters.category) conditions.push(eq(products.category, filters.category))
  if (filters.category1) conditions.push(eq(products.category1, filters.category1))
  if (filters.category2) conditions.push(eq(products.category2, filters.category2))
  if (filters.brand) conditions.push(eq(products.brand, filters.brand))
  if (filters.genre) conditions.push(eq(products.genre, filters.genre))
  if (filters.activity) conditions.push(arrayContains(products.activity, [filters.activity]))

  for (const [key, value] of Object.entries(filters.variantOptions ?? {})) {
    if (!/^[a-zA-Z0-9_]+$/.test(key) || !value) continue
    conditions.push(
      exists(
        db.select({ x: sql<number>`1` }).from(variants)
          .where(and(eq(variants.productId, products.id), sql`${variants.options} ->> ${key} = ${value}`))
      )
    )
  }

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(products.id)

  const withVariants = await attachVariants(rows)

  // Apply price filters in JS after fetching (variants hold price)
  return withVariants.filter((p) => {
    if (!p.variants.length) return true
    const prices = p.variants.map((v) => parseFloat(v.price))
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (filters.minPrice && max < parseFloat(filters.minPrice)) return false
    if (filters.maxPrice && min > parseFloat(filters.maxPrice)) return false
    return true
  })
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithVariants[]> {
  const rows = await getDb()
    .select()
    .from(products)
    .where(eq(products.published, true))
    .limit(limit)
  return attachVariants(rows)
}

export async function getProductsOnSale(limit = 8): Promise<ProductWithVariants[]> {
  const saleProductIds = await getDb()
    .selectDistinct({ productId: variants.productId })
    .from(variants)
    .where(gt(variants.discountPercent, 0))

  if (!saleProductIds.length) return []

  const ids = saleProductIds.map((r) => r.productId)
  const rows = await getDb()
    .select()
    .from(products)
    .where(and(eq(products.published, true), inArray(products.id, ids)))
    .limit(limit)

  return attachVariants(rows)
}

export async function getVariantsBySlug(slug: string): Promise<{ product: Product; variants: Variant[] } | null> {
  const [product] = await getDb()
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.published, true)))
    .limit(1)

  if (!product) return null

  const productVariants = await getDb()
    .select()
    .from(variants)
    .where(eq(variants.productId, product.id))
    .orderBy(variants.id)

  return { product, variants: productVariants }
}

export async function getProductById(id: string): Promise<ProductWithVariants | null> {
  const [product] = await getDb()
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1)

  if (!product) return null
  const [result] = await attachVariants([product])
  return result ?? null
}

export async function getVariantById(variantId: string): Promise<Variant | null> {
  const [variant] = await getDb()
    .select()
    .from(variants)
    .where(eq(variants.id, variantId))
    .limit(1)
  return variant ?? null
}

export async function getVariantsByProductId(productId: string): Promise<Variant[]> {
  return getDb()
    .select()
    .from(variants)
    .where(eq(variants.productId, productId))
    .orderBy(variants.id)
}

export async function getFilterOptions() {
  const rows = await getDb()
    .select({
      category: products.category,
      brand: products.brand,
      genre: products.genre,
    })
    .from(products)

  const categories = [...new Set(rows.map((r) => r.category).filter(Boolean))] as string[]
  const brands = [...new Set(rows.map((r) => r.brand).filter(Boolean))] as string[]
  const genres = [...new Set(rows.map((r) => r.genre).filter(Boolean))] as string[]

  const activityRows = await getDb()
    .select({ activity: sql<string[]>`${products.activity}` })
    .from(products)
  const activities = [...new Set(activityRows.flatMap((r) => r.activity ?? []).filter(Boolean))]

  return { categories, brands, genres, activities }
}

export async function getFormOptions() {
  const rows = await getDb()
    .select({
      category: products.category,
      category1: products.category1,
      category2: products.category2,
      brand: products.brand,
    })
    .from(products)

  const activityRows = await getDb()
    .select({ activity: sql<string[]>`${products.activity}` })
    .from(products)

  const variantOptionRows = await getDb()
    .select({ options: sql<Record<string, string>>`${variants.options}` })
    .from(variants)

  const variantOptionKeys = [
    ...new Set(
      variantOptionRows
        .flatMap((r) => Object.keys(r.options ?? {}))
        .filter((k) => k !== 'color' && k !== 'size')
    ),
  ]

  return {
    categories: [...new Set(rows.map((r) => r.category).filter(Boolean))] as string[],
    categories1: [...new Set(rows.map((r) => r.category1).filter(Boolean))] as string[],
    categories2: [...new Set(rows.map((r) => r.category2).filter(Boolean))] as string[],
    brands: [...new Set(rows.map((r) => r.brand).filter(Boolean))] as string[],
    activities: [...new Set(activityRows.flatMap((r) => r.activity ?? []).filter(Boolean))],
    variantOptionKeys,
  }
}

export async function getCategoryNavData(params: {
  category?: string
  category1?: string
  genre?: string
}): Promise<{ items: string[]; activeParam: 'category' | 'category1' | 'category2' }> {
  const db = getDb()
  const base = [eq(products.published, true)]
  if (params.genre) base.push(eq(products.genre, params.genre))

  if (params.category1) {
    if (params.category) base.push(eq(products.category, params.category))
    base.push(eq(products.category1, params.category1))
    const rows = await db.selectDistinct({ value: products.category2 }).from(products).where(and(...base))
    return { items: rows.map((r) => r.value).filter(Boolean) as string[], activeParam: 'category2' }
  }

  if (params.category) {
    base.push(eq(products.category, params.category))
    const rows = await db.selectDistinct({ value: products.category1 }).from(products).where(and(...base))
    return { items: rows.map((r) => r.value).filter(Boolean) as string[], activeParam: 'category1' }
  }

  const rows = await db.selectDistinct({ value: products.category }).from(products).where(and(...base))
  return { items: rows.map((r) => r.value).filter(Boolean) as string[], activeParam: 'category' }
}

// Returns facets (brands + option values) scoped to navigation context only
// (excludes brand/option filters so users can always switch between values)
export async function getProductFacets(params: {
  category?: string
  category1?: string
  category2?: string
  genre?: string
  activity?: string
}): Promise<{
  brands: string[]
  optionValues: Record<string, string[]>
  priceRange: { min: number; max: number }
}> {
  const db = getDb()
  const conditions = [eq(products.published, true)]
  if (params.category) conditions.push(eq(products.category, params.category))
  if (params.category1) conditions.push(eq(products.category1, params.category1))
  if (params.category2) conditions.push(eq(products.category2, params.category2))
  if (params.genre) conditions.push(eq(products.genre, params.genre))
  if (params.activity) conditions.push(arrayContains(products.activity, [params.activity]))

  const [productRows, variantRows] = await Promise.all([
    db.select({ brand: products.brand }).from(products).where(and(...conditions)),
    db
      .select({ options: sql<Record<string, string>>`${variants.options}`, price: variants.price })
      .from(variants)
      .innerJoin(products, eq(variants.productId, products.id))
      .where(and(...conditions)),
  ])

  const brands = [...new Set(productRows.map((r) => r.brand).filter(Boolean))] as string[]

  const prices = variantRows.map((r) => parseFloat(r.price)).filter((n) => !isNaN(n))
  const priceRange = {
    min: prices.length ? Math.floor(Math.min(...prices)) : 0,
    max: prices.length ? Math.ceil(Math.max(...prices)) : 0,
  }

  const optMap: Record<string, Set<string>> = {}
  for (const { options } of variantRows) {
    for (const [key, val] of Object.entries(options ?? {})) {
      if (!optMap[key]) optMap[key] = new Set()
      optMap[key].add(val)
    }
  }

  return {
    brands,
    priceRange,
    optionValues: Object.fromEntries(Object.entries(optMap).map(([k, v]) => [k, [...v]])),
  }
}

export async function getProductsByIds(ids: string[]): Promise<ProductWithVariants[]> {
  if (!ids.length) return []
  const rows = await getDb().select().from(products).where(inArray(products.id, ids))
  return attachVariants(rows)
}

export async function getAllVariantsWithProduct(): Promise<{ variant: Variant; product: Product }[]> {
  const rows = await getDb()
    .select({ variant: variants, product: products })
    .from(variants)
    .innerJoin(products, eq(variants.productId, products.id))
    .where(eq(products.published, true))
    .orderBy(products.name, variants.id)
  return rows
}

export async function getFeaturedVariants(ids: string[]): Promise<{ variant: Variant; product: Product }[]> {
  if (!ids.length) return []
  const rows = await getDb()
    .select({ variant: variants, product: products })
    .from(variants)
    .innerJoin(products, eq(variants.productId, products.id))
    .where(inArray(variants.id, ids))
  // Preserve order from ids array
  return ids
    .map((id) => rows.find((r) => r.variant.id === id))
    .filter((r): r is { variant: Variant; product: Product } => r !== undefined)
}

export async function getProductsWithVariantCount(): Promise<{ product: Product; variantCount: number; defaultImageUrl: string | null }[]> {
  const defaultVariant = getDb()
    .select({ productId: variants.productId, imageUrl: variants.imageUrl })
    .from(variants)
    .where(eq(variants.isDefault, true))
    .as('defaultVariant')

  const rows = await getDb()
    .select({ product: products, variantCount: count(variants.id), defaultImageUrl: defaultVariant.imageUrl })
    .from(products)
    .leftJoin(variants, eq(variants.productId, products.id))
    .leftJoin(defaultVariant, eq(defaultVariant.productId, products.id))
    .groupBy(products.id, defaultVariant.imageUrl)
    .orderBy(products.id)

  return rows.map((r) => ({ product: r.product, variantCount: Number(r.variantCount), defaultImageUrl: r.defaultImageUrl ?? null }))
}

export function getDiscountedPrice(price: string, discountPercent: number | null): number {
  const p = parseFloat(price)
  if (!discountPercent) return p
  return parseFloat((p * (1 - discountPercent / 100)).toFixed(2))
}
