import { getDb } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export interface MenuData {
  uomo: CategoryTree
  donna: CategoryTree
  attrezzatura: Record<string, string[]>
  brands: string[]
  sports: string[]
}

// category -> category1 -> category2[]
type CategoryTree = Record<string, Record<string, string[]>>

function addToTree(
  tree: CategoryTree,
  category: string | null,
  category1: string | null,
  category2: string | null
) {
  if (!category) return
  if (!tree[category]) tree[category] = {}
  if (!category1) return
  if (!tree[category][category1]) tree[category][category1] = []
  if (category2 && !tree[category][category1].includes(category2)) {
    tree[category][category1].push(category2)
  }
}

export async function getMegaMenuData(): Promise<MenuData> {
  const rows = await getDb()
    .select({
      category: products.category,
      category1: products.category1,
      category2: products.category2,
      genre: products.genre,
      brand: products.brand,
    })
    .from(products)
    .where(eq(products.published, true))

  const activityRows = await getDb()
    .select({ activity: sql<string[]>`${products.activity}` })
    .from(products)
    .where(eq(products.published, true))

  const uomo: CategoryTree = {}
  const donna: CategoryTree = {}
  const attrezzatura: Record<string, string[]> = {}

  for (const r of rows) {
    const isForMen = r.genre === 'M' || r.genre === 'U'
    const isForWomen = r.genre === 'F' || r.genre === 'U'

    if (isForMen) addToTree(uomo, r.category, r.category1, r.category2)
    if (isForWomen) addToTree(donna, r.category, r.category1, r.category2)

    if (r.category === 'Attrezzatura' && r.category1) {
      if (!attrezzatura[r.category1]) attrezzatura[r.category1] = []
      if (r.category2 && !attrezzatura[r.category1].includes(r.category2)) {
        attrezzatura[r.category1].push(r.category2)
      }
    }
  }

  const brands = [...new Set(rows.map((r) => r.brand).filter(Boolean))] as string[]
  const sports = [...new Set(activityRows.flatMap((r) => r.activity ?? []).filter(Boolean))]

  return { uomo, donna, attrezzatura, brands, sports }
}
