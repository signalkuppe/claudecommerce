'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DefaultVariantRadio({
  variantId,
  productId,
  isDefault,
}: {
  variantId: string
  productId: string
  isDefault: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleChange() {
    if (isDefault) return
    setLoading(true)
    await fetch(`/api/variants/${variantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, isDefault: true }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <input
      type="radio"
      checked={isDefault}
      onChange={handleChange}
      disabled={loading}
      className="h-4 w-4 accent-gray-900 cursor-pointer disabled:cursor-wait"
    />
  )
}
