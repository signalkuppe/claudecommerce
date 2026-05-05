import { getStripe } from '@/lib/stripe'
import { getDb } from '@/lib/db'
import { orders, orderItems, variants } from '@/lib/db/schema'
import type Stripe from 'stripe'
import type { CartItem } from '@/lib/cart'
import { revalidateTag } from 'next/cache'
import { eq, sql, and, gte } from 'drizzle-orm'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return new Response('Missing stripe-signature header', { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const cartItems: CartItem[] = session.metadata?.cartItems
      ? JSON.parse(session.metadata.cartItems)
      : []

    const total = cartItems
      .reduce((sum, i) => sum + i.price * i.quantity, 0)
      .toFixed(2)

    const [order] = await getDb()
      .insert(orders)
      .values({
        status: 'paid',
        total,
        stripeSessionId: session.id,
        customerEmail: session.customer_details?.email ?? null,
      })
      .returning()

    if (cartItems.length && order) {
      await getDb().insert(orderItems).values(
        cartItems.map((item) => ({
          orderId: order.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.price.toFixed(2),
        }))
      )
    }

    for (const item of cartItems) {
      await getDb()
        .update(variants)
        .set({ stock: sql`CASE WHEN ${variants.stock} IS NULL THEN NULL ELSE ${variants.stock} - ${item.quantity} END` })
        .where(and(eq(variants.id, item.variantId), sql`(${variants.stock} IS NULL OR ${variants.stock} >= ${item.quantity})`))
    }

    revalidateTag('orders', 'max')
  }

  return new Response(null, { status: 200 })
}
