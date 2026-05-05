'use client'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import Image from 'next/image'
import type { Variant } from '@/lib/db/schema'

const schema = z.object({
  id: z.string().min(1, 'Required'),
  price: z.string().min(1, 'Required'),
  discountPercent: z.coerce.number().int().min(0).max(100).optional(),
  stock: z.coerce.number().int().min(0).optional().nullable(),
  optionColor: z.string().optional(),
  optionSize: z.string().optional(),
  extraOptions: z.record(z.string(), z.string()).optional(),
  isDefault: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

function variantToForm(v: Variant): FormData {
  const opts = v.options as Record<string, string>
  const { color, size, ...rest } = opts
  return {
    id: v.id,
    price: v.price,
    discountPercent: v.discountPercent ?? 0,
    stock: v.stock ?? null,
    optionColor: color ?? '',
    optionSize: size ?? '',
    extraOptions: rest,
    isDefault: v.isDefault,
  }
}

export default function VariantForm({
  productId,
  initialData,
  extraOptions = [],
  onSuccess,
}: {
  productId: string
  initialData?: Variant
  extraOptions?: string[]
  onSuccess?: () => void
}) {
  const router = useRouter()
  const isEdit = !!initialData
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? variantToForm(initialData)
      : { discountPercent: 0, isDefault: false, extraOptions: {} },
  })

  const optionColor = useWatch({ control, name: 'optionColor' })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setApplied(false)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) setImageUrl(data.url)
    } finally {
      setUploading(false)
    }
  }

  async function handleApplyToColor() {
    if (!imageUrl || !optionColor) return
    setApplying(true)
    try {
      await fetch(`/api/products/${productId}/variants/apply-color-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: optionColor, imageUrl }),
      })
      setApplied(true)
      setTimeout(() => setApplied(false), 3000)
    } finally {
      setApplying(false)
    }
  }

  async function onSubmit(data: FormData) {
    const options: Record<string, string> = {}
    if (data.optionColor) options.color = data.optionColor
    if (data.optionSize) options.size = data.optionSize
    for (const [k, v] of Object.entries(data.extraOptions ?? {})) {
      if (v) options[k] = v
    }

    const payload = {
      id: data.id,
      price: data.price,
      discountPercent: data.discountPercent ?? 0,
      stock: data.stock ?? null,
      options,
      isDefault: data.isDefault ?? false,
      imageUrl: imageUrl || undefined,
    }

    const url = isEdit
      ? `/api/variants/${initialData!.id}`
      : `/api/products/${productId}/variants`
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      if (onSuccess) {
        router.refresh()
        onSuccess()
      } else {
        router.push(`/admin/products/${productId}`)
        router.refresh()
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-8 max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Variant ID" error={errors.id?.message}>
          <input {...register('id')} className={inputClass} disabled={isEdit} />
        </Field>
        <Field label="Price (€)" error={errors.price?.message}>
          <input {...register('price')} type="number" step="0.01" className={inputClass} />
        </Field>
        <Field label="Discount %">
          <input {...register('discountPercent')} type="number" min={0} max={100} className={inputClass} />
        </Field>
        <Field label="Stock (leave empty = unlimited)">
          <input {...register('stock')} type="number" min={0} placeholder="∞" className={inputClass} />
        </Field>
        <Field label="Is default">
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input {...register('isDefault')} type="checkbox" className="w-4 h-4 rounded border-gray-300" />
            <span className="text-sm text-gray-700">Show as default variant</span>
          </label>
        </Field>
        <Field label="Option: Color">
          <input {...register('optionColor')} className={inputClass} />
        </Field>
        <Field label="Option: Size">
          <input {...register('optionSize')} className={inputClass} />
        </Field>
        {extraOptions.map((key) => (
          <Field key={key} label={`Option: ${key.charAt(0).toUpperCase() + key.slice(1)}`}>
            <input {...register(`extraOptions.${key}`)} className={inputClass} />
          </Field>
        ))}
        <Field label="Variant image" className="col-span-2">
          <div className="flex items-start gap-4">
            {imageUrl && (
              <div className="relative w-20 h-20 shrink-0 bg-gray-100 rounded overflow-hidden">
                <Image src={imageUrl} alt="Variant" fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-sm border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : imageUrl ? 'Change image' : 'Upload image'}
              </button>
              {imageUrl && optionColor && (
                <div>
                  <button
                    type="button"
                    onClick={handleApplyToColor}
                    disabled={applying}
                    className="text-sm text-blue-600 hover:underline disabled:opacity-50 transition"
                  >
                    {applying ? 'Applying…' : applied ? `✓ Applied to all "${optionColor}" variants` : `Apply to all "${optionColor}" variants`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add variant'}
        </button>
        <button
          type="button"
          onClick={() => onSuccess ? onSuccess() : router.push(`/admin/products/${productId}`)}
          className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900'

function Field({
  label,
  children,
  error,
  className,
}: {
  label: string
  children: React.ReactNode
  error?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
