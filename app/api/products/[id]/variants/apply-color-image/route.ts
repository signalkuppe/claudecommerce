import type { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { variants } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  color: z.string().min(1),
  imageUrl: z.string().url(),
})

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
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { color, imageUrl } = parsed.data

  const result = await getDb()
    .update(variants)
    .set({ imageUrl, updatedAt: new Date() })
    .where(
      and(
        eq(variants.productId, productId),
        sql`${variants.options}->>'color' = ${color}`
      )
    )
    .returning({ id: variants.id })

  return Response.json({ updated: result.length })
}
