"use client"

// import { useState } from "react"
import { useMemo } from "react"
import { TrendingUp, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import type { AnalysisSummary } from "@/lib/types/analytics"

interface AnalyticsOverviewProps {
  data: AnalysisSummary[]
}

export default function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  // const [timeframe, setTimeframe] = useState("all")

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
      <div className="bg-[#252525] border border-[#383838] rounded-lg p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-500 text-sm font-medium">Total Analyses</h3>
          <div className="flex items-center text-green-400 text-xs">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />+{improvementRate}%
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-200">{totalAnalyses}</span>
          <span className="text-gray-500 text-sm">resumes</span>
        </div>
      </div>

     
      <div className="bg-[#252525] border border-[#383838] rounded-lg p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-500 text-sm font-medium">Match Rate</h3>
          <div className="flex items-center text-green-400 text-xs">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            +8%
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-200">{matchRate}%</span>
          <span className="text-gray-500 text-sm">high match</span>
        </div>
      </div>

      
      <div className="bg-[#252525] border border-[#383838] rounded-lg p-5">
        <h3 className="text-gray-500 text-sm font-medium mb-4">Match Distribution</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
              <span className="text-gray-400 text-xs">High</span>
            </div>
            <span className="text-gray-300 text-xs font-medium">{highMatches}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
              <span className="text-gray-400 text-xs">Medium</span>
            </div>
            <span className="text-gray-300 text-xs font-medium">{mediumMatches}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
              <span className="text-gray-400 text-xs">Low</span>
            </div>
            <span className="text-gray-300 text-xs font-medium">{lowMatches}</span>
          </div>
        </div>
      </div>

      
      <div className="bg-[#252525] border border-[#383838] rounded-lg p-5">
        <h3 className="text-gray-500 text-sm font-medium mb-4">Common Feedback</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <span className="text-gray-400 text-xs">Missing quantifiable results</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
            <span className="text-gray-400 text-xs">Needs more specific technical skills</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            <span className="text-gray-400 text-xs">Strong project descriptions</span>
          </div>
        </div>
      </div>
    </div>
  )
}
