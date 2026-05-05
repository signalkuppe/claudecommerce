import ProductForm from '@/components/admin/ProductForm'
import { getFormOptions } from '@/lib/products'

export default async function NewProductPage() {
  const options = await getFormOptions()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">New product</h1>
      <ProductForm options={options} />
    </div>
  )
}
