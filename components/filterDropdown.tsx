"use client"

import { useState } from "react"
import { Filter, Check } from "lucide-react"

export default function FilterDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    high: true,
    medium: true,
    low: true,
    lastWeek: false,
    lastMonth: true,
    lastYear: true,
  })

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#252525] border border-[#383838] rounded-md text-gray-300 text-sm"
      >
        <Filter className="w-4 h-4" />
        <span>Filter</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#252525] border border-[#383838] rounded-md shadow-lg z-10">
          <div className="p-3 border-b border-[#383838]">
            <h4 className="text-gray-300 text-sm font-medium mb-2">Match Score</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleFilter("high")}>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    filters.high ? "bg-green-500 border-green-500" : "border-gray-600"
                  }`}
                >
                  {filters.high && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-400 text-sm">High</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleFilter("medium")}>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    filters.medium ? "bg-green-500 border-green-500" : "border-gray-600"
                  }`}
                >
                  {filters.medium && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-400 text-sm">Medium</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleFilter("low")}>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    filters.low ? "bg-green-500 border-green-500" : "border-gray-600"
                  }`}
                >
                  {filters.low && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-400 text-sm">Low</span>
              </div>
            </div>
          </div>

          <div className="p-3">
            <h4 className="text-gray-300 text-sm font-medium mb-2">Time Period</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleFilter("lastWeek")}>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    filters.lastWeek ? "bg-green-500 border-green-500" : "border-gray-600"
                  }`}
                >
                  {filters.lastWeek && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-400 text-sm">Last Week</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleFilter("lastMonth")}>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    filters.lastMonth ? "bg-green-500 border-green-500" : "border-gray-600"
                  }`}
                >
                  {filters.lastMonth && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-400 text-sm">Last Month</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleFilter("lastYear")}>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    filters.lastYear ? "bg-green-500 border-green-500" : "border-gray-600"
                  }`}
                >
                  {filters.lastYear && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-400 text-sm">Last Year</span>
              </div>
            </div>
          </div>

          <div className="flex border-t border-[#383838] p-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 py-1.5 bg-[#333] hover:bg-[#444] text-gray-300 rounded-md text-sm transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
