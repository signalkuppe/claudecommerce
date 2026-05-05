import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { orders, orderItems, variants, products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import OrderStatusForm from '@/components/admin/OrderStatusForm'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [order] = await getDb().select().from(orders).where(eq(orders.id, Number(id))).limit(1)
  if (!order) notFound()

  const items = await getDb()
    .select({ item: orderItems, variant: variants, product: products })
    .from(orderItems)
    .leftJoin(variants, eq(orderItems.variantId, variants.id))
    .leftJoin(products, eq(variants.productId, products.id))
    .where(eq(orderItems.orderId, order.id))

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Order #{order.id}</h1>
      <p className="text-sm text-gray-500 mb-8">
        {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
      </p>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Customer</span>
          <span>{order.customerEmail ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Stripe session</span>
          <span className="font-mono text-xs truncate max-w-xs">{order.stripeSessionId ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total</span>
          <span className="font-semibold">€{parseFloat(order.total).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Status</span>
          <OrderStatusForm orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Variant</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Qty</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Unit price</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(({ item, variant, product }) => {
              const opts = variant?.options as Record<string, string> | null
              const optStr = opts ? Object.entries(opts).map(([k, v]) => `${k}: ${v}`).join(', ') : ''
              return (
                <tr key={item.id}>
                  <td className="px-4 py-3">{product?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{optStr || item.variantId}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">€{parseFloat(item.unitPrice).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    €{(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
