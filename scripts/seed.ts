import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())
import { getDb } from '../lib/db'
import { products, variants, orderItems, users } from '../lib/db/schema'
import bcrypt from 'bcryptjs'

const seedProducts = [
  {
    id: 'P1',
    slug: 'p1-maglietta-base',
    published: true,
    brand: 'Mammut',
    name: 'Maglietta base',
    category: 'Abbigliamento',
    category1: 'Magliette',
    category2: 'Magliette tecniche',
    activity: ['tempo libero'],
    genre: 'M',
    description: 'Maglietta 100% cotone',
    descriptionEn: '100% cotton shirt',
  },
  {
    id: 'P2',
    slug: 'p2-deuter-guide-34',
    published: true,
    brand: 'Deuter',
    name: 'Deuter Guide 34',
    category: 'Attrezzatura',
    category1: 'Zaini',
    category2: 'Zaini da trekking',
    activity: ['alpinismo', 'scialpinismo'],
    genre: 'U',
    description: 'Zaino alpinismo',
    descriptionEn: 'Alpine backpack',
  },
  {
    id: 'P3',
    slug: 'p3-scarpa-mont-blanc',
    published: true,
    brand: 'Scarpa',
    name: 'Scarpa Mont Blanc',
    category: 'Attrezzatura',
    category1: 'Scarponi',
    category2: 'Scarponi da alpinismo',
    activity: ['alpinismo'],
    genre: 'M',
    description: 'Scarpone tecnico alpinismo',
    descriptionEn: 'Technical mountaineering boot',
  },
]

const seedVariants = [
  { id: 'V1', productId: 'P1', price: '34.00', discountPercent: 0,  options: { color: 'Rosso', size: 'S' },  isDefault: true  },
  { id: 'V2', productId: 'P1', price: '34.00', discountPercent: 0,  options: { color: 'Verde', size: 'S' },  isDefault: false },
  { id: 'V3', productId: 'P1', price: '34.00', discountPercent: 20, options: { color: 'Blu',   size: 'S' },  isDefault: false },
  { id: 'V4', productId: 'P2', price: '200.00', discountPercent: 0, options: { color: 'Nero',  liters: '34' }, isDefault: true  },
  { id: 'V5', productId: 'P2', price: '200.00', discountPercent: 0, options: { color: 'Rosso', liters: '34' }, isDefault: false },
  { id: 'V6', productId: 'P3', price: '450.00', discountPercent: 0, options: { color: 'Nero',  size: '42' }, isDefault: true  },
  { id: 'V7', productId: 'P3', price: '450.00', discountPercent: 0, options: { color: 'Nero',  size: '43' }, isDefault: false },
  { id: 'V8', productId: 'P3', price: '450.00', discountPercent: 0, options: { color: 'Nero',  size: '44' }, isDefault: false },
]

async function seed() {
  const db = getDb()

  console.log('Clearing order items, variants, products…')
  await db.delete(orderItems)
  await db.delete(variants)
  await db.delete(products)

  console.log('Seeding products…')
  await db.insert(products).values(seedProducts)
  console.log(`Inserted ${seedProducts.length} products`)

  console.log('Seeding variants…')
  await db.insert(variants).values(seedVariants)
  console.log(`Inserted ${seedVariants.length} variants`)

  console.log('Seeding admin user…')
  const hash = await bcrypt.hash('adminpassword', 12)
  await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      email: 'admin@claudecommerce.com',
      passwordHash: hash,
      role: 'admin',
      name: 'Admin',
    })
    .onConflictDoNothing()

  console.log('Done! Admin: admin@claudecommerce.com / adminpassword')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
