import { getDb } from '@/lib/db'
import { siteSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function getSetting(key: string): Promise<string | null> {
  try {
    const [row] = await getDb()
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1)
    return row?.value ?? null
  } catch {
    return null
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await getDb()
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } })
}
