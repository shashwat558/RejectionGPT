"use client"

import { useMemo, useState } from "react"
import AnalysisCard from "./analysisCard"
import FilterDropdown from "./filterDropdown"
import { Search } from "lucide-react"

type Item = {
  id: string
  jobTitle: string
  company: string
  date: string
  matchScore: string
  description?: string
}

export default function AnalyticsSearchList({ data }: { data: Item[] }) {
  const [query, setQuery] = useState("")

  const normalized = (value?: string) => (value || "").toLowerCase()

  const filtered = useMemo(() => {
    const q = normalized(query)
    if (!q) return data
    return data.filter((item) => {
      return (
        normalized(item.jobTitle).includes(q) ||
        normalized(item.company).includes(q) ||
        normalized(item.description).includes(q) ||
        normalized(item.date).includes(q)
      )
    })
  }, [data, query])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gray-700"></div>
          <h2 className="text-xl text-gray-300 font-semibold">Recent Analyses</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search analyses..."
              className="w-full md:w-64 pl-9 pr-3 py-2 bg-[#252525] border border-[#383838] rounded-md text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#444]"
            />
          </div>

          <FilterDropdown />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((feedback) => (
          <AnalysisCard key={feedback.id} feedback={feedback} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-[#252525] border border-[#383838] rounded-lg p-8 text-center mt-4">
          <h3 className="text-gray-300 text-lg font-medium mb-2">No matches</h3>
          <p className="text-gray-500">Try a different search query</p>
        </div>
      )}
    </>
  )
}


