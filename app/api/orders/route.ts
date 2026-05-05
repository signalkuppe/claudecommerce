import { getDb } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { desc } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const rows = await getDb().select().from(orders).orderBy(desc(orders.createdAt))
  return Response.json(rows)
}
