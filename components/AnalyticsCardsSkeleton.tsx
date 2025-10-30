"use client"

export default function AnalyticsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[#252525] border border-[#383838] rounded-lg p-4 animate-pulse">
          <div className="h-4 w-24 bg-[#333] rounded mb-3" />
          <div className="h-6 w-40 bg-[#333] rounded mb-2" />
          <div className="h-3 w-full bg-[#333] rounded mb-1" />
          <div className="h-3 w-3/4 bg-[#333] rounded mb-1" />
          <div className="h-3 w-2/3 bg-[#333] rounded" />
          <div className="mt-4 h-6 w-24 bg-[#333] rounded" />
        </div>
      ))}
    </div>
  )
}


