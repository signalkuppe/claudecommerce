import { getProductsWithVariantCount } from '@/lib/products'
import Link from 'next/link'
import ProductsTable from '@/components/admin/ProductsTable'

export default async function AdminProductsPage() {
  const rows = await getProductsWithVariantCount()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
        >
          + New product
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm">
        <ProductsTable products={rows} />
      </div>
    </div>
  )
}
