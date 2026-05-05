import type { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { and, eq, ne } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')?.trim()
  const excludeId = searchParams.get('excludeId')

  if (!slug) return Response.json({ available: false })

  const conditions = [eq(products.slug, slug)]
  if (excludeId) conditions.push(ne(products.id, excludeId))

  const [existing] = await getDb()
    .select({ id: products.id })
    .from(products)
    .where(and(...conditions))
    .limit(1)

  return Response.json({ available: !existing })
}
