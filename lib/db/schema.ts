import {
  pgTable,
  pgEnum,
  text,
  integer,
  numeric,
  timestamp,
  serial,
  jsonb,
  primaryKey,
  boolean,
} from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['admin', 'customer'])
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
])

export const products = pgTable('products', {
  id:            text('id').primaryKey(),
  slug:          text('slug').notNull().unique(),
  brand:         text('brand'),
  name:          text('name').notNull(),
  description:   text('description'),
  descriptionEn: text('description_en'),
  category:      text('category').notNull(),
  category1:     text('category_1'),
  category2:     text('category_2'),
  activity:      text('activity').array().notNull().default([]),
  variantOptions: text('variant_options').array().notNull().default([]),
  genre:         text('genre'),
  imageUrl:      text('image_url'),
  published:     boolean('published').notNull().default(false),
  createdAt:     timestamp('created_at').defaultNow(),
  updatedAt:     timestamp('updated_at').defaultNow(),
})

export const variants = pgTable('variants', {
  id:              text('id').primaryKey(),
  productId:       text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  price:           numeric('price', { precision: 10, scale: 2 }).notNull(),
  discountPercent: integer('discount_percent').default(0),
  imageUrl:        text('image_url'),
  options:         jsonb('options').notNull().default({}),
  isDefault:       boolean('is_default').notNull().default(false),
  stock:           integer('stock'),
  createdAt:       timestamp('created_at').defaultNow(),
  updatedAt:       timestamp('updated_at').defaultNow(),
})

export const users = pgTable('users', {
  id:            text('id').primaryKey(),
  email:         text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image:         text('image'),
  passwordHash:  text('password_hash'),
  role:          userRoleEnum('role').notNull().default('customer'),
  name:          text('name'),
  createdAt:     timestamp('created_at').defaultNow(),
})

export const accounts = pgTable(
  'accounts',
  {
    userId:            text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type:              text('type').notNull(),
    provider:          text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token:     text('refresh_token'),
    access_token:      text('access_token'),
    expires_at:        integer('expires_at'),
    token_type:        text('token_type'),
    scope:             text('scope'),
    id_token:          text('id_token'),
    session_state:     text('session_state'),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })]
)

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId:       text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires:      timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token:      text('token').notNull(),
    expires:    timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
)

export const orders = pgTable('orders', {
  id:              serial('id').primaryKey(),
  userId:          text('user_id').references(() => users.id),
  status:          orderStatusEnum('status').notNull().default('pending'),
  total:           numeric('total', { precision: 10, scale: 2 }).notNull(),
  stripeSessionId: text('stripe_session_id').unique(),
  customerEmail:   text('customer_email'),
  createdAt:       timestamp('created_at').defaultNow(),
  updatedAt:       timestamp('updated_at').defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id:        serial('id').primaryKey(),
  orderId:   integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  variantId: text('variant_id').notNull().references(() => variants.id),
  quantity:  integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
})

export const siteSettings = pgTable('site_settings', {
  key:       text('key').primaryKey(),
  value:     text('value'),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type Product    = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Variant    = typeof variants.$inferSelect
export type NewVariant = typeof variants.$inferInsert
export type User       = typeof users.$inferSelect
export type Order      = typeof orders.$inferSelect
export type OrderItem  = typeof orderItems.$inferSelect
