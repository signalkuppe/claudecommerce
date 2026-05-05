'use client'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/db/schema'

type Row = { product: Product; variantCount: number; defaultImageUrl: string | null }

function PublishToggle({ product, variantCount }: { product: Product; variantCount: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [published, setPublished] = useState(product.published)

  async function toggle() {
    if (!published && variantCount === 0) {
      alert('Add at least one variant before publishing.')
      return
    }
    setLoading(true)
    const next = !published
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: next }),
    })
    if (res.ok) {
      setPublished(next)
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error ?? 'Could not update')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={!published && variantCount === 0 ? 'Add a variant first' : undefined}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        published ? 'bg-gray-900' : 'bg-gray-200'
      } ${!published && variantCount === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ${
          published ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function ProductsTable({ products }: { products: Row[] }) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  async function handleDelete(id: string) {
    if (!confirm('Delete this product and all its variants?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const columns: ColumnDef<Row>[] = [
    {
      id: 'image',
      header: '',
      size: 48,
      cell: ({ row }) =>
        row.original.defaultImageUrl ? (
          <div className="relative w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
            <Image src={row.original.defaultImageUrl} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 bg-gray-100 rounded shrink-0" />
        ),
    },
    { accessorFn: (r) => r.product.id, id: 'id', header: 'ID', size: 80 },
    { accessorFn: (r) => r.product.brand, id: 'brand', header: 'Brand' },
    { accessorFn: (r) => r.product.name, id: 'name', header: 'Name' },
    { accessorFn: (r) => r.product.category, id: 'category', header: 'Category' },
    {
      accessorFn: (r) => r.variantCount,
      id: 'variantCount',
      header: 'Variants',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {getValue<number>()}
        </span>
      ),
    },
    {
      id: 'published',
      header: 'Published',
      cell: ({ row }) => (
        <PublishToggle product={row.original.product} variantCount={row.original.variantCount} />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-3">
          <Link
            href={`/admin/products/${row.original.product.id}`}
            className="text-xs text-blue-600 hover:underline"
          >
            Manage
          </Link>
          <button
            onClick={() => handleDelete(row.original.product.id)}
            className="text-xs text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div>
      <div className="p-4 border-b border-gray-100">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search products…"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-gray-100 text-left">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-gray-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
        {table.getFilteredRowModel().rows.length} product
        {table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
