import CartContentsWrapper from '@/components/store/CartContentsWrapper'

export const dynamic = 'force-dynamic'

export default function CartPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Your cart</h1>
      <CartContentsWrapper />
    </div>
  )
}
