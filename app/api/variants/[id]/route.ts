import type { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { variants } from '@/lib/db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { getVariantById } from '@/lib/products'

const updateSchema = z.object({
  price: z.string().optional(),
  discountPercent: z.number().int().min(0).max(100).optional(),
  imageUrl: z.string().url().optional().nullable(),
  options: z.record(z.string()).optional(),
  isDefault: z.boolean().optional(),
  stock: z.number().int().min(0).nullable().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const variant = await getVariantById(id)
  if (!variant) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(variant)
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

  const db = getDb()
  const existing = await getVariantById(id)
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  if (parsed.data.isDefault) {
    await db
      .update(variants)
      .set({ isDefault: false })
      .where(and(eq(variants.productId, existing.productId), ne(variants.id, id)))
  }

  const [updated] = await db
    .update(variants)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(variants.id, id))
    .returning()

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
  const existing = await getVariantById(id)
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  const siblings = await getDb()
    .select()
    .from(variants)
    .where(eq(variants.productId, existing.productId))

  if (siblings.length <= 1) {
    return Response.json(
      { error: 'Cannot delete the last variant of a product' },
      { status: 409 }
    )
  }

  await getDb().delete(variants).where(eq(variants.id, id))
  return Response.json({ success: true })
}
