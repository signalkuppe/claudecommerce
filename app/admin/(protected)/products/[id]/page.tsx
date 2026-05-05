import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/products'
import Link from 'next/link'
import Image from 'next/image'
import VariantActions from '@/components/admin/VariantActions'
import { AddVariantSheet } from '@/components/admin/VariantSheet'
import DefaultVariantRadio from '@/components/admin/DefaultVariantRadio'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/products" className="text-sm text-gray-500 hover:underline mb-1 block">
            ← Products
          </Link>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {product.brand && <p className="text-gray-500 text-sm mt-0.5">{product.brand}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            product.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {product.published ? 'Published' : 'Draft'}
          </span>
          <Link
            href={`/admin/products/${id}/edit`}
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Edit product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Details</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div><dt className="text-gray-500">ID</dt><dd className="font-mono">{product.id}</dd></div>
          <div><dt className="text-gray-500">Slug</dt><dd className="font-mono">{product.slug}</dd></div>
          <div><dt className="text-gray-500">Category</dt><dd>{[product.category, product.category1, product.category2].filter(Boolean).join(' › ')}</dd></div>
          <div><dt className="text-gray-500">Genre</dt><dd>{product.genre ?? '—'}</dd></div>
          <div><dt className="text-gray-500">Activity</dt><dd>{product.activity?.join(', ') || '—'}</dd></div>
          {product.imageUrl && (
            <div className="col-span-2">
              <dt className="text-gray-500 mb-2">Cover image</dt>
              <div className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              </div>
            </div>
          )}
        </dl>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold">Variants</h2>
          <AddVariantSheet productId={id} extraOptions={product.variantOptions ?? []} />
        </div>
        {product.variants.length === 0 ? (
          <p className="px-6 py-8 text-gray-400 text-sm text-center">No variants yet. Add one to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Options</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Default</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {product.variants.map((v) => {
                const opts = v.options as Record<string, string>
                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{v.id}</td>
                    <td className="px-4 py-3">€{parseFloat(v.price).toFixed(2)}</td>
                    <td className="px-4 py-3">{v.discountPercent ? `${v.discountPercent}%` : '—'}</td>
                    <td className="px-4 py-3">
                      {Object.entries(opts).map(([k, val]) => (
                        <span key={k} className="inline-flex items-center gap-1 mr-2 text-xs">
                          <span className="text-gray-400">{k}:</span> {val}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3">
                      {v.stock === null ? (
                        <span className="text-xs text-gray-400">∞</span>
                      ) : v.stock === 0 ? (
                        <span className="text-xs font-medium text-red-500">Out of stock</span>
                      ) : v.stock <= 5 ? (
                        <span className="text-xs font-medium text-amber-500">{v.stock} left</span>
                      ) : (
                        <span className="text-xs text-gray-700">{v.stock}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DefaultVariantRadio
                        variantId={v.id}
                        productId={id}
                        isDefault={v.isDefault}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {v.imageUrl && (
                        <div className="relative w-10 h-10 bg-gray-100 rounded overflow-hidden">
                          <Image src={v.imageUrl} alt="" fill className="object-cover" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <VariantActions variant={v} productId={id} extraOptions={product.variantOptions ?? []} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
