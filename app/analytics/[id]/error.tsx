"use client"

import ErrorState from "@/components/ui/error-state"

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <ErrorState
          title="Unable to load analysis"
          message="Please retry or head back to your analytics dashboard."
          action={
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded-md bg-white border border-gray-200 shadow-sm text-black hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Try again
            </button>
          }
        />
      </div>
    </div>
  )
}
