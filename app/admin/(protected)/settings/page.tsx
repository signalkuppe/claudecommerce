import { getSetting } from '@/lib/settings'
import { getAllVariantsWithProduct } from '@/lib/products'
import HeroImageUpload from '@/components/admin/HeroImageUpload'
import FeaturedProductsPicker from '@/components/admin/FeaturedProductsPicker'

export default async function SettingsPage() {
  const [heroImageUrl, featuredRaw, allVariants] = await Promise.all([
    getSetting('hero_image_url'),
    getSetting('featured_variant_ids'),
    getAllVariantsWithProduct(),
  ])

  const featuredIds: string[] = featuredRaw ? JSON.parse(featuredRaw) : []

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Storefront
        </h2>
        <HeroImageUpload currentUrl={heroImageUrl} />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Featured products
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Pick up to 8 variants to showcase on the homepage carousel.
        </p>
        <FeaturedProductsPicker all={allVariants} initialIds={featuredIds} />
      </div>
    </div>
  )
}
