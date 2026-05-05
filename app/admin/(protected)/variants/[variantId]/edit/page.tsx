import { notFound } from 'next/navigation'
import { getVariantById, getProductById } from '@/lib/products'
import VariantForm from '@/components/admin/VariantForm'
import Link from 'next/link'

export default async function EditVariantPage({
  params,
  searchParams,
}: {
  params: Promise<{ variantId: string }>
  searchParams: Promise<{ productId?: string }>
}) {
  const { variantId } = await params
  const { productId: qProductId } = await searchParams
  const variant = await getVariantById(variantId)
  if (!variant) notFound()

  const productId = qProductId ?? variant.productId
  const product = await getProductById(productId)

  return (
    <div>
      <Link href={`/admin/products/${productId}`} className="text-sm text-gray-500 hover:underline mb-4 block">
        ← Back to product
      </Link>
      <h1 className="text-2xl font-bold mb-8">Edit variant</h1>
      <VariantForm productId={productId} initialData={variant} extraOptions={product?.variantOptions ?? []} />
    </div>
  )
}
