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
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-black text-sm shadow-sm hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filter</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-black text-xs font-semibold uppercase tracking-wider mb-3">Match Score</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter("high")}>
                <div
                  className={`w-4 h-4 rounded transition-colors flex items-center justify-center ${
                    filters.high ? "bg-black border-black" : "border border-gray-300 group-hover:border-gray-400"
                  }`}
                >
                  {filters.high && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-700 text-sm group-hover:text-black transition-colors">High</span>
              </div>
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter("medium")}>
                <div
                  className={`w-4 h-4 rounded transition-colors flex items-center justify-center ${
                    filters.medium ? "bg-black border-black" : "border border-gray-300 group-hover:border-gray-400"
                  }`}
                >
                  {filters.medium && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-700 text-sm group-hover:text-black transition-colors">Medium</span>
              </div>
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter("low")}>
                <div
                  className={`w-4 h-4 rounded transition-colors flex items-center justify-center ${
                    filters.low ? "bg-black border-black" : "border border-gray-300 group-hover:border-gray-400"
                  }`}
                >
                  {filters.low && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-700 text-sm group-hover:text-black transition-colors">Low</span>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h4 className="text-black text-xs font-semibold uppercase tracking-wider mb-3">Time Period</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter("lastWeek")}>
                <div
                  className={`w-4 h-4 rounded transition-colors flex items-center justify-center ${
                    filters.lastWeek ? "bg-black border-black" : "border border-gray-300 group-hover:border-gray-400"
                  }`}
                >
                  {filters.lastWeek && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-700 text-sm group-hover:text-black transition-colors">Last Week</span>
              </div>
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter("lastMonth")}>
                <div
                  className={`w-4 h-4 rounded transition-colors flex items-center justify-center ${
                    filters.lastMonth ? "bg-black border-black" : "border border-gray-300 group-hover:border-gray-400"
                  }`}
                >
                  {filters.lastMonth && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-700 text-sm group-hover:text-black transition-colors">Last Month</span>
              </div>
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter("lastYear")}>
                <div
                  className={`w-4 h-4 rounded transition-colors flex items-center justify-center ${
                    filters.lastYear ? "bg-black border-black" : "border border-gray-300 group-hover:border-gray-400"
                  }`}
                >
                  {filters.lastYear && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-700 text-sm group-hover:text-black transition-colors">Last Year</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border-t border-gray-100 p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
