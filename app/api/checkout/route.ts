import { getStripe } from '@/lib/stripe'
import { getVariantById } from '@/lib/products'
import type { CartItem } from '@/lib/cart'

export async function POST(request: Request) {
  const { items }: { items: CartItem[] } = await request.json()

  if (!items?.length) {
    return Response.json({ error: 'Cart is empty' }, { status: 400 })
  }

  for (const item of items) {
    const variant = await getVariantById(item.variantId)
    if (!variant) {
      return Response.json({ error: `Variant ${item.variantId} not found` }, { status: 400 })
    }
    if (variant.stock !== null && variant.stock < item.quantity) {
      return Response.json(
        { error: `Not enough stock for ${item.options ? Object.values(item.options).join(' / ') : item.variantId}. Available: ${variant.stock}` },
        { status: 409 }
      )
    }
  }

  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.name,
        ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }))

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cart`,
    metadata: { cartItems: JSON.stringify(items) },
  })

  return Response.json({ url: session.url })
}
