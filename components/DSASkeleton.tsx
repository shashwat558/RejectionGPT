"use client"

export default function DSASkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
          <div className="h-5 w-1/2 bg-gray-200 rounded mb-4" />
          <div className="flex gap-2 mb-4">
            <div className="h-5 w-16 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded" />
            <div className="h-5 w-12 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="mt-5 h-9 w-full bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>
  )
}


