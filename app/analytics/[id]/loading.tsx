export default function Loading() {
  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded" />
        <div className="h-10 w-64 bg-white/10 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-3xl bg-white/5 border border-white/10" />
          <div className="lg:col-span-2 h-80 rounded-3xl bg-white/5 border border-white/10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-white/5 border border-white/10" />
          ))}
        </div>
      </div>
    </div>
  )
}
