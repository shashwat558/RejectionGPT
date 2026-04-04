"use client"

export default function AnalyticsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 shadow-sm rounded-lg p-5 animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
          <div className="h-6 w-40 bg-gray-200 rounded mb-3" />
          <div className="h-3 w-full bg-gray-200 rounded mb-1.5" />
          <div className="h-3 w-3/4 bg-gray-200 rounded mb-1.5" />
          <div className="h-3 w-2/3 bg-gray-200 rounded" />
          <div className="mt-5 h-6 w-24 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  )
}


