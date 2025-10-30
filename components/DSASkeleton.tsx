"use client"

export default function DSASkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#252525] border border-[#2f2f2f] rounded-lg p-5">
          <div className="h-5 w-1/2 bg-[#333] rounded mb-3" />
          <div className="flex gap-2 mb-3">
            <div className="h-5 w-16 bg-[#333] rounded" />
            <div className="h-5 w-20 bg-[#333] rounded" />
            <div className="h-5 w-12 bg-[#333] rounded" />
          </div>
          <div className="h-4 w-3/4 bg-[#333] rounded" />
          <div className="mt-4 h-9 w-full bg-[#333] rounded" />
        </div>
      ))}
    </div>
  )
}


