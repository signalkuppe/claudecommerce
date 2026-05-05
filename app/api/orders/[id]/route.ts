import type { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'

const statusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const [order] = await getDb().select().from(orders).where(eq(orders.id, Number(id))).limit(1)
  if (!order) return Response.json({ error: 'Not found' }, { status: 404 })

  const items = await getDb().select().from(orderItems).where(eq(orderItems.orderId, order.id))
  return Response.json({ ...order, items })
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
  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const [updated] = await getDb()
    .update(orders)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(orders.id, Number(id)))
    .returning()

  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 })
  revalidateTag('orders', 'max')
  return Response.json(updated)
}
