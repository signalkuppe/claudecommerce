import { getDb } from '@/lib/db'
import { orders, products, users } from '@/lib/db/schema'
import { eq, count, sum } from 'drizzle-orm'

export default async function AdminDashboard() {
  const [[{ total: productCount }], [{ total: orderCount }], [{ total: userCount }], [{ revenue }]] =
    await Promise.all([
      getDb().select({ total: count() }).from(products),
      getDb().select({ total: count() }).from(orders),
      getDb().select({ total: count() }).from(users),
      getDb().select({ revenue: sum(orders.total) }).from(orders).where(eq(orders.status, 'paid')),
    ])

  const stats = [
    { label: 'Products', value: productCount, icon: '🏷️' },
    { label: 'Orders', value: orderCount, icon: '📦' },
    { label: 'Users', value: userCount, icon: '👥' },
    { label: 'Revenue', value: revenue ? `€${parseFloat(revenue).toFixed(2)}` : '€0.00', icon: '💰' },
  ]

  const recentOrders = await getDb()
    .select()
    .from(orders)
    .orderBy(orders.createdAt)
    .limit(5)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">Recent orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">ID</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="py-2 font-mono text-xs">#{o.id}</td>
                  <td className="py-2">{o.customerEmail ?? '—'}</td>
                  <td className="py-2">€{parseFloat(o.total).toFixed(2)}</td>
                  <td className="py-2">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-gray-100'}`}>
      {status}
    </span>
  )
}
