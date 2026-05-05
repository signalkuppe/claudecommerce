import StoreHeader from '@/components/store/StoreHeader'
import { getMegaMenuData } from '@/lib/menu'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const menuData = await getMegaMenuData()
  return (
    <>
      <StoreHeader menuData={menuData} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} ClaudeCommerce
        </div>
      </footer>
    </>
  )
}
