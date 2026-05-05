# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build (NODE_ENV=production enforced)
npm run db:generate      # Generate Drizzle migrations after schema changes
npm run db:migrate       # Apply pending migrations to Neon
npm run db:studio        # Open Drizzle Studio GUI
npm run seed             # Seed DB with sample products + admin user
```

## Architecture

Sport outdoor e-commerce (bergzeit-style) built with Next.js 16 App Router. Two route groups share the same repo: `app/(store)/` (public storefront) and `app/admin/` (protected dashboard).

**Stack:** Next.js 16.2.4 · Neon Postgres + Drizzle ORM · Auth.js v5 (credentials, JWT) · Stripe · Zustand (cart) · Tailwind v4

### Key Files

| File | Purpose |
|------|---------|
| `lib/db/index.ts` | `getDb()` — lazy Neon HTTP + Drizzle factory (falls back to dummy URL at build time) |
| `lib/db/schema.ts` | Full schema: `products`, `users`, `orders`, `orderItems`, plus Auth.js adapter tables |
| `lib/auth.ts` | NextAuth v5 config — exports `handlers`, `auth`, `signIn`, `signOut` |
| `lib/cart.ts` | Zustand store with localStorage persistence |
| `lib/products.ts` | Data-access helpers: `getFilteredProducts`, `groupByParent`, `getVariantsBySlug`, etc. |
| `lib/stripe.ts` | Singleton Stripe client via `getStripe()` |
| `proxy.ts` | Route guard replacing `middleware.ts` — protects `/admin/*` |
| `drizzle.config.ts` | Uses `DATABASE_URL_UNPOOLED` + `postgres` driver (neon serverless needs WebSocket; unpooled doesn't) |

### Product Data Model

Products are stored at the **variant level** — every row in `products` is a specific SKU (color/size/etc). Related variants share a `parent_id`. The `slug` is shared across all variants of the same parent. The `options` column is `jsonb` and holds variant attributes (`{ color, size, liters, … }`).

On listing pages, `groupByParent()` deduplicates to show one card per parent product.

### Auth & Admin Protection

Three layers:
1. **`proxy.ts`** — intercepts `/admin/:path*` before the request reaches any handler; redirects unauthenticated/non-admin users to `/admin/login`
2. **`app/admin/layout.tsx`** — server component that calls `auth()` and `redirect()` on every admin page render
3. **Individual API routes** — check `session.user.role === 'admin'` and return 403 otherwise

JWT strategy is required because a Credentials provider is used (Auth.js v5 drops database sessions for credentials by default).

### Cart

Zustand + `persist` middleware writes to `localStorage` under key `claudecommerce-cart`. Never SSR cart-dependent components directly — use the `CartContentsWrapper` pattern (`dynamic(..., { ssr: false })` inside a `'use client'` wrapper) to avoid hydration mismatches.

### Stripe Checkout Flow

`/api/checkout` → creates Stripe session with cart items in metadata → redirects user to Stripe → webhook at `/api/webhooks/stripe` receives `checkout.session.completed` → inserts `orders` + `order_items` rows. The webhook handler must use `request.text()` (raw body) for HMAC signature verification — never `request.json()`.

## Next.js 16 Breaking Changes

These will silently break things if missed:

- **`params` and `searchParams` are Promises** — always `await` them:
  ```ts
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
  }
  ```
- **`middleware.ts` → `proxy.ts`** — export function must be named `proxy`, not `middleware`
- **No `tailwind.config.js`** — Tailwind v4 is CSS-first; config lives in `globals.css`
- **No `webpack` key in `next.config.ts`** — Turbopack is default for both dev and build
- **`ssr: false` in Server Components is forbidden** — wrap in a `'use client'` component first
- **`NODE_ENV` must be `production` during build** — the `build` script enforces this; running `next build` directly in a shell with `NODE_ENV=development` breaks static generation

## Seed Data

`npm run seed` inserts:
- 8 product variants across 3 parent products (Mammut t-shirt, Deuter backpack, Scarpa boot)
- Admin user: `admin@claudecommerce.com` / `adminpassword`

Safe to re-run (uses `onConflictDoNothing`).
