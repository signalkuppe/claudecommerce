import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export function getDb() {
  // During build, DATABASE_URL may be absent; placeholder passes neon()'s URL validation
  // but is never actually queried since API routes are force-dynamic at runtime.
  const url = process.env.DATABASE_URL_DEV ?? process.env.DATABASE_URL ?? 'postgresql://build:build@build.neon.tech/build'
  return drizzle(neon(url), { schema })
}
