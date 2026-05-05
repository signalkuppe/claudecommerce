import type { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { products, variants } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { getProductById } from '@/lib/products'

const updateSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  category: z.string().optional(),
  category1: z.string().optional(),
  category2: z.string().optional(),
  activity: z.array(z.string()).optional(),
  variantOptions: z.array(z.string()).optional(),
  genre: z.string().optional(),
  brand: z.string().optional(),
  published: z.boolean().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(product)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.published === true) {
    const [{ variantCount }] = await getDb()
      .select({ variantCount: count(variants.id) })
      .from(variants)
      .where(eq(variants.productId, id))
    if (Number(variantCount) === 0) {
      return Response.json(
        { error: 'A product must have at least one variant before it can be published.' },
        { status: 422 }
      )
    }
  }

  const [updated] = await getDb()
    .update(products)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning()

  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 })
  revalidateTag('products', 'max')
  return Response.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const [deleted] = await getDb()
    .delete(products)
    .where(eq(products.id, id))
    .returning()

  if (!deleted) return Response.json({ error: 'Not found' }, { status: 404 })
  revalidateTag('products', 'max')
  return Response.json({ success: true })
}
