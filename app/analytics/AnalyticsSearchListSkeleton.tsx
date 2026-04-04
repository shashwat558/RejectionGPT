export default function AnalyticsSearchListSkeleton() {
  return (
    <div className="mt-10">
      {/* Section Header with Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gray-200 rounded" />
          <div className="h-6 w-40 bg-gray-200 rounded" />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input Skeleton */}
          <div className="h-10 w-full md:w-64 bg-gray-50 border border-gray-200 rounded-md shadow-sm" />
          {/* Filter Dropdown Skeleton */}
          <div className="h-10 w-32 bg-gray-50 border border-gray-200 rounded-md shadow-sm" />
        </div>
      </div>

      {/* Analysis Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 animate-pulse"
          >
            {/* Date Badge */}
            <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
            {/* Title */}
            <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
            {/* Company */}
            <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
            {/* Description lines */}
            <div className="h-3 w-full bg-gray-200 rounded mb-1" />
            <div className="h-3 w-3/4 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-2/3 bg-gray-200 rounded mb-4" />
            {/* Match Score */}
            <div className="h-6 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

