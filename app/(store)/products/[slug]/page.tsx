import { notFound } from 'next/navigation'
import { getVariantsBySlug } from '@/lib/products'
import ProductDetail from '@/components/store/ProductDetail'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getVariantsBySlug(slug)
  if (!result) return {}
  return {
    title: `${result.product.name} — ClaudeCommerce`,
    description: result.product.description ?? undefined,
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getVariantsBySlug(slug)
  if (!result) notFound()

  return <ProductDetail product={result.product} variants={result.variants} />
}
