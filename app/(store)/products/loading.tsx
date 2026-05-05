export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <div className="h-7 w-40 bg-gray-100 rounded-md animate-pulse mb-10" />
      <div className="flex gap-10">
        <aside className="hidden lg:block w-48 shrink-0 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-7 bg-gray-100 rounded-md animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </aside>
        <div className="flex-1">
          <div className="flex flex-wrap gap-4 pb-5 mb-6 border-b border-gray-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-7 w-24 bg-gray-100 rounded-md animate-pulse" />
            ))}
          </div>
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-3 w-2/5 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
