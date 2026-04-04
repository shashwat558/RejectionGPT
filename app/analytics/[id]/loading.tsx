export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="h-10 w-64 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-3xl bg-white border border-gray-200 shadow-sm" />
          <div className="lg:col-span-2 h-80 rounded-3xl bg-white border border-gray-200 shadow-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-white border border-gray-200 shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  )
}
