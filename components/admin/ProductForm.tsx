'use client'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import type { Product } from '@/lib/db/schema'
import SelectWithCreate from './SelectWithCreate'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

type FormOptions = {
  categories: string[]
  categories1: string[]
  categories2: string[]
  brands: string[]
  activities: string[]
  variantOptionKeys: string[]
}

const schema = z.object({
  id: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  category1: z.string().optional(),
  category2: z.string().optional(),
  activity: z.array(z.string()),
  genre: z.string().optional(),
  brand: z.string().optional(),
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  variantOptions: z.array(z.string()),
})
type FormData = z.infer<typeof schema>

function productToForm(p: Product): FormData {
  return {
    id: p.id,
    slug: p.slug,
    category: p.category,
    category1: p.category1 ?? '',
    category2: p.category2 ?? '',
    activity: p.activity ?? [],
    variantOptions: p.variantOptions ?? [],
    genre: p.genre ?? '',
    brand: p.brand ?? '',
    name: p.name,
    description: p.description ?? '',
    descriptionEn: p.descriptionEn ?? '',
  }
}

export default function ProductForm({
  initialData,
  options,
}: {
  initialData?: Product
  options: FormOptions
}) {
  const router = useRouter()
  const isEdit = !!initialData

  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function checkSlug(value: string) {
    if (slugTimer.current) clearTimeout(slugTimer.current)
    const trimmed = value.trim()
    if (!trimmed) { setSlugStatus('idle'); return }
    setSlugStatus('checking')
    slugTimer.current = setTimeout(async () => {
      const params = new URLSearchParams({ slug: trimmed })
      if (isEdit) params.set('excludeId', initialData!.id)
      const res = await fetch(`/api/products/check-slug?${params}`)
      const { available } = await res.json()
      setSlugStatus(available ? 'available' : 'taken')
    }, 400)
  }

  const [cats, setCats] = useState(options.categories)
  const [cats1, setCats1] = useState(options.categories1)
  const [cats2, setCats2] = useState(options.categories2)
  const [acts, setActs] = useState(options.activities)
  const [varOptKeys, setVarOptKeys] = useState(options.variantOptionKeys)
  const [brands, setBrands] = useState(options.brands)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? productToForm(initialData) : { activity: [], variantOptions: [] },
  })

  async function onSubmit(data: FormData) {
    const payload = {
      id: data.id,
      slug: data.slug,
      category: data.category,
      category1: data.category1 || undefined,
      category2: data.category2 || undefined,
      activity: data.activity,
      variantOptions: data.variantOptions,
      genre: data.genre || undefined,
      brand: data.brand || undefined,
      name: data.name,
      description: data.description || undefined,
      descriptionEn: data.descriptionEn || undefined,
    }

    const url = isEdit ? `/api/products/${initialData!.id}` : '/api/products'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const saved = await res.json()
      router.push(`/admin/products/${isEdit ? initialData!.id : saved.id}`)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-8 max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Product ID" error={errors.id?.message}>
          <input {...register('id')} className={inputClass} disabled={isEdit} />
        </Field>
        <Field label="Slug" error={errors.slug?.message || (slugStatus === 'taken' ? 'Already in use' : undefined)}>
          <div className="relative">
            <input
              {...register('slug', {
                onChange: (e) => checkSlug(e.target.value),
              })}
              className={inputClass}
            />
            {slugStatus === 'checking' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">checking…</span>
            )}
            {slugStatus === 'available' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600">✓ available</span>
            )}
            {slugStatus === 'taken' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-500">✗ taken</span>
            )}
          </div>
        </Field>
        <Field label="Brand">
          <Controller
            control={control}
            name="brand"
            render={({ field }) => (
              <SelectWithCreate
                value={field.value ?? ''}
                onChange={(v) => field.onChange(v ?? '')}
                options={brands}
                placeholder="Select brand…"
                onNewOption={(v) => setBrands((prev) => [...prev, v])}
              />
            )}
          />
        </Field>
        <Field label="Genre">
          <select {...register('genre')} className={inputClass}>
            <option value="">—</option>
            <option value="M">Men</option>
            <option value="F">Women</option>
            <option value="U">Unisex</option>
          </select>
        </Field>
        <Field label="Name" error={errors.name?.message} className="col-span-2">
          <input {...register('name')} className={inputClass} />
        </Field>

        <Field label="Category" error={errors.category?.message}>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <SelectWithCreate
                value={field.value}
                onChange={field.onChange}
                options={cats}
                placeholder="Select category…"
                onNewOption={(v) => setCats((prev) => [...prev, v])}
              />
            )}
          />
        </Field>
        <Field label="Category 1">
          <Controller
            control={control}
            name="category1"
            render={({ field }) => (
              <SelectWithCreate
                value={field.value ?? ''}
                onChange={field.onChange}
                options={cats1}
                placeholder="Select…"
                onNewOption={(v) => setCats1((prev) => [...prev, v])}
              />
            )}
          />
        </Field>
        <Field label="Category 2">
          <Controller
            control={control}
            name="category2"
            render={({ field }) => (
              <SelectWithCreate
                value={field.value ?? ''}
                onChange={field.onChange}
                options={cats2}
                placeholder="Select…"
                onNewOption={(v) => setCats2((prev) => [...prev, v])}
              />
            )}
          />
        </Field>

        <Field label="Activity" className="col-span-2">
          <Controller
            control={control}
            name="activity"
            render={({ field }) => (
              <ActivitySelector
                value={field.value}
                onChange={field.onChange}
                options={acts}
                onNewOption={(v) => setActs((prev) => [...prev, v])}
              />
            )}
          />
        </Field>

        <Field
          label="Extra variant options"
          className="col-span-2"
          hint="Color and size are always included. Add extra options like liters, material, gender…"
        >
          <Controller
            control={control}
            name="variantOptions"
            render={({ field }) => (
              <ActivitySelector
                value={field.value}
                onChange={field.onChange}
                options={varOptKeys}
                onNewOption={(v) => setVarOptKeys((prev) => [...prev, v])}
                dialogTitle="New variant option"
                dialogPlaceholder="e.g. liters, material, fit…"
              />
            )}
          />
        </Field>

        <Field label="Description" className="col-span-2">
          <textarea {...register('description')} rows={2} className={inputClass} />
        </Field>
        <Field label="Description (EN)" className="col-span-2">
          <textarea {...register('descriptionEn')} rows={2} className={inputClass} />
        </Field>
      </div>

      {isEdit && (
        <p className="text-xs text-gray-400">
          Cover image and publish status are managed from the product detail page.
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || slugStatus === 'taken' || slugStatus === 'checking'}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function ActivitySelector({
  value,
  onChange,
  options,
  onNewOption,
  dialogTitle = 'New activity',
  dialogPlaceholder = 'e.g. scialpinismo',
}: {
  value: string[]
  onChange: (v: string[]) => void
  options: string[]
  onNewOption: (v: string) => void
  dialogTitle?: string
  dialogPlaceholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [newValue, setNewValue] = useState('')

  function toggle(act: string) {
    onChange(value.includes(act) ? value.filter((a) => a !== act) : [...value, act])
  }

  function handleCreate() {
    const trimmed = newValue.trim()
    if (!trimmed) return
    onNewOption(trimmed)
    onChange([...value, trimmed])
    setNewValue('')
    setOpen(false)
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {options.map((act) => (
          <button
            key={act}
            type="button"
            onClick={() => toggle(act)}
            className={`px-3 py-1 text-sm rounded-full border transition ${
              value.includes(act)
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-300 text-gray-700 hover:border-gray-500'
            }`}
          >
            {act}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-3 py-1 text-sm rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-gray-500 transition"
        >
          + New
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <input
            autoFocus
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder={dialogPlaceholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <DialogFooter>
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100 transition">Cancel</button>
            <button type="button" onClick={handleCreate} disabled={!newValue.trim()} className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition disabled:opacity-50">Create</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900'

function Field({
  label,
  children,
  error,
  hint,
  className,
}: {
  label: string
  children: React.ReactNode
  error?: string
  hint?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
