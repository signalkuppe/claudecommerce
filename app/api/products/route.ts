import type { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { getProductsWithVariantCount } from '@/lib/products'

const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  category1: z.string().optional(),
  category2: z.string().optional(),
  activity: z.array(z.string()).default([]),
  variantOptions: z.array(z.string()).default([]),
  genre: z.string().optional(),
  brand: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
})

export async function GET() {
  const rows = await getProductsWithVariantCount()
  return Response.json(rows)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const [created] = await getDb().insert(products).values(parsed.data).returning()
  revalidateTag('products', 'max')
  return Response.json(created, { status: 201 })
}
