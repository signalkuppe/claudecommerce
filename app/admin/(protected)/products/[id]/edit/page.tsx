import { notFound } from 'next/navigation'
import { getProductById, getFormOptions } from '@/lib/products'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, options] = await Promise.all([getProductById(id), getFormOptions()])
  if (!product) notFound()

  return (
    <div>
      <Link href={`/admin/products/${id}`} className="text-sm text-gray-500 hover:underline mb-4 block">
        ← Back to product
      </Link>
      <h1 className="text-2xl font-bold mb-8">Edit product</h1>
      <ProductForm initialData={product} options={options} />
    </div>
  )
}
