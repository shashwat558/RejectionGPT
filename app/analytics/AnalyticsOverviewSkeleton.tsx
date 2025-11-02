export default function AnalyticsOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[#252525] border border-[#383838] rounded-lg p-5 animate-pulse"
        >
          {/* Card Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="h-4 w-24 bg-[#333] rounded" />
            <div className="h-3 w-12 bg-[#333] rounded" />
          </div>
          {/* Card Content */}
          <div className="flex items-baseline gap-2 mb-4">
            <div className="h-8 w-16 bg-[#333] rounded" />
            <div className="h-4 w-16 bg-[#333] rounded" />
          </div>
          {/* Additional content for some cards */}
          {i >= 2 && (
            <div className="space-y-2">
              <div className="h-3 w-full bg-[#333] rounded" />
              <div className="h-3 w-4/5 bg-[#333] rounded" />
              <div className="h-3 w-3/5 bg-[#333] rounded" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

