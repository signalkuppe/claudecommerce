'use client'
import { useRouter } from 'next/navigation'
import { EditVariantSheet } from './VariantSheet'
import type { Variant } from '@/lib/db/schema'

export default function VariantActions({
  variant,
  productId,
  extraOptions,
}: {
  variant: Variant
  productId: string
  extraOptions?: string[]
}) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this variant?')) return
    const res = await fetch(`/api/variants/${variant.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error ?? 'Could not delete variant')
    }
  }

  return (
    <div className="flex gap-3 items-center">
      <EditVariantSheet productId={productId} variant={variant} extraOptions={extraOptions} />
      <button onClick={handleDelete} className="text-xs text-red-500 hover:underline">
        Delete
      </button>
    </div>
  )
}
