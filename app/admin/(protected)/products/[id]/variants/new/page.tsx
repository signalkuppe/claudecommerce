import VariantForm from '@/components/admin/VariantForm'
import { getProductById } from '@/lib/products'
import Link from 'next/link'

export default async function NewVariantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)

  return (
    <div>
      <Link href={`/admin/products/${id}`} className="text-sm text-gray-500 hover:underline mb-4 block">
        ← Back to product
      </Link>
      <h1 className="text-2xl font-bold mb-8">Add variant</h1>
      <VariantForm productId={id} extraOptions={product?.variantOptions ?? []} />
    </div>
  )
}
