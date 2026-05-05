import type { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { variants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { getVariantsByProductId } from '@/lib/products'

const variantSchema = z.object({
  id: z.string().min(1),
  price: z.string().min(1),
  discountPercent: z.number().int().min(0).max(100).optional().default(0),
  imageUrl: z.string().url().optional().nullable(),
  options: z.record(z.string()).default({}),
  isDefault: z.boolean().default(false),
  stock: z.number().int().min(0).nullable().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const rows = await getVariantsByProductId(id)
  return Response.json(rows)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: productId } = await params
  const body = await request.json()
  const parsed = variantSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const db = getDb()

  if (parsed.data.isDefault) {
    await db
      .update(variants)
      .set({ isDefault: false })
      .where(eq(variants.productId, productId))
  }

  const [created] = await db
    .insert(variants)
    .values({ ...parsed.data, productId })
    .returning()

  return Response.json(created, { status: 201 })
}
