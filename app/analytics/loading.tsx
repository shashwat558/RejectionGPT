export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="absolute top-0 left-0 w-full h-[300px] pointer-events-none bg-gradient-to-b from-white to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-pulse">
          <div className="flex-1">
            {/* Badge Skeleton */}
            <div className="inline-flex items-center h-7 w-32 bg-gray-200 rounded-full mb-2" />
            {/* Title Skeleton */}
            <div className="h-10 w-64 bg-gray-200 rounded mb-2" />
          </div>

          {/* Button Skeleton */}
          <div className="h-10 w-32 bg-gray-200 rounded-md self-start md:self-center" />
        </div>

        {/* Analytics Overview Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-5 animate-pulse"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-12 bg-gray-200 rounded" />
              </div>
              {/* Card Content */}
              <div className="flex items-baseline gap-2 mb-4">
                <div className="h-8 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
              {/* Additional content for some cards */}
              {i >= 2 && (
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-4/5 bg-gray-200 rounded" />
                  <div className="h-3 w-3/5 bg-gray-200 rounded" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recent Analyses Section Skeleton */}
        <div className="mt-10">
          {/* Section Header with Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gray-200 rounded" />
              <div className="h-6 w-40 bg-gray-200 rounded" />
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input Skeleton */}
              <div className="h-10 w-full md:w-64 bg-gray-100 border border-gray-200 rounded-md shadow-sm" />
              {/* Filter Dropdown Skeleton */}
              <div className="h-10 w-32 bg-gray-100 border border-gray-200 rounded-md shadow-sm" />
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
      </div>
    </div>
  );
}

