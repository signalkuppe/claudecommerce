export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedVariants, getProductsByIds } from '@/lib/products'
import { getSetting } from '@/lib/settings'
import FeaturedCarousel from '@/components/store/FeaturedCarousel'

export default async function HomePage() {
  const [featuredRaw, heroImageUrl] = await Promise.all([
    getSetting('featured_variant_ids'),
    getSetting('hero_image_url'),
  ])

  const featuredIds: string[] = featuredRaw ? JSON.parse(featuredRaw) : []
  const featuredVariants = await getFeaturedVariants(featuredIds)

  const productIds = [...new Set(featuredVariants.map((r) => r.product.id))]
  const productsWithVariants = await getProductsByIds(productIds)

  const carouselItems = featuredVariants.map(({ variant, product }) => ({
    variant,
    product,
    productWithVariants:
      productsWithVariants.find((p) => p.id === product.id) ?? { ...product, variants: [variant] },
  }))

  return (
    <div>
      <section className="relative bg-gray-900 h-[680px] flex items-end overflow-hidden">
        {heroImageUrl && (
          <Image src={heroImageUrl} alt="Hero" fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-7xl mx-auto px-6 w-full pb-14">
          <h1 className="text-3xl font-semibold text-white mb-6 leading-tight">
            Gear up for the mountain.
          </h1>
          <Link
            href="/products"
            className="inline-block bg-white text-gray-900 text-sm px-6 py-2.5 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Shop all products
          </Link>
        </div>
      </section>

      {carouselItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            Featured
          </h2>
          <FeaturedCarousel items={carouselItems} />
        </section>
      )}
    </div>
  )
}
