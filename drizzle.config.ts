import { defineConfig } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

// Prefer dev branch when available, fall back to main branch
const url = process.env.DATABASE_URL_DEV_UNPOOLED
  ?? process.env.DATABASE_URL_UNPOOLED
  ?? process.env.DATABASE_URL!

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url },
})
