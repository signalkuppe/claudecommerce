import Link from 'next/link'
import ClearCart from '@/components/store/ClearCart'

export const dynamic = 'force-dynamic'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-6">✓</div>
      <h1 className="text-3xl font-bold mb-4">Order confirmed!</h1>
      <p className="text-gray-600 mb-2">Thank you for your purchase.</p>
      {session_id && (
        <p className="text-xs text-gray-400 mb-8">Reference: {session_id}</p>
      )}
      <ClearCart />
      <Link
        href="/products"
        className="inline-block bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-700 transition"
      >
        Continue shopping
      </Link>
    </div>
  )
}
