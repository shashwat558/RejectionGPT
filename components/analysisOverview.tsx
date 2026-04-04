"use client"

import { useMemo } from "react"
import { TrendingUp, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import type { AnalysisSummary } from "@/lib/types/analytics"

interface AnalyticsOverviewProps {
  data: AnalysisSummary[]
}

export default function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const { totalAnalyses, highMatches, mediumMatches, lowMatches, matchRate } = useMemo(() => {
    const parseScore = (score?: string) => parseInt((score || "0").replace("%", ""))
    const total = data.length
    const high = data.filter((item) => parseScore(item.matchScore) >= 80).length
    const medium = data.filter((item) => {
      const val = parseScore(item.matchScore)
      return val >= 50 && val < 80
    }).length
    const low = data.filter((item) => parseScore(item.matchScore) < 50).length
    const match = total > 0 ? Math.round((high / total) * 100) : 0
    return { totalAnalyses: total, highMatches: high, mediumMatches: medium, lowMatches: low, matchRate: match }
  }, [data])

  const improvementRate = 12

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Analyses */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-500 text-sm font-medium">Total Analyses</h3>
          <div className="flex items-center text-green-600 font-medium text-xs bg-green-50 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3 mr-1" />+{improvementRate}%
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-black">{totalAnalyses}</span>
          <span className="text-gray-500 text-sm">resumes</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-500 text-sm font-medium">Match Rate</h3>
          <div className="flex items-center text-green-600 font-medium text-xs bg-green-50 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3 mr-1" />
            +8%
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-black">{matchRate}%</span>
          <span className="text-gray-500 text-sm">high match</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-gray-500 text-sm font-medium mb-4">Match Distribution</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 border border-green-600/20"></div>
              <span className="text-gray-600 text-sm font-medium">High</span>
            </div>
            <span className="text-black text-sm font-semibold">{highMatches}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 mr-2 border border-yellow-500/20"></div>
              <span className="text-gray-600 text-sm font-medium">Medium</span>
            </div>
            <span className="text-black text-sm font-semibold">{mediumMatches}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 mr-2 border border-red-500/20"></div>
              <span className="text-gray-600 text-sm font-medium">Low</span>
            </div>
            <span className="text-black text-sm font-semibold">{lowMatches}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-gray-500 text-sm font-medium mb-4">Common Feedback</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <span className="text-gray-700 text-sm">Missing quantifiable results</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
            <span className="text-gray-700 text-sm">Needs more specific technical skills</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <span className="text-gray-700 text-sm">Strong project descriptions</span>
          </div>
        </div>
      </div>
    </div>
  )
}
