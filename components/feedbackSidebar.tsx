"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, FileText, Search, LayoutGrid } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { AnalysisSummary } from "@/lib/types/analytics"

interface FeedbackSidebarProps {
  feedbacks: AnalysisSummary[]
  currentId: string
  className?: string
}

export default function FeedbackSidebar({ feedbacks, currentId, className = "" }: FeedbackSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFeedbacks = feedbacks.filter(
    (feedback) =>
      (feedback.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (feedback.company || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getScoreColor = (score: string) => {
    const numeric = parseInt(score.replace("%", "")) || 0;
    if (numeric >= 70) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (numeric >= 40) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 320 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`h-screen hidden xl:flex flex-col border-r border-gray-200 bg-gray-50/50 relative z-20 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 mb-2 border-b border-gray-200">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <LayoutGrid className="w-5 h-5 text-black" />
              <span className="font-semibold text-black tracking-tight">History</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-black transition-colors ml-auto"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-5 mb-4 mt-2">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-black text-sm placeholder-gray-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
            />
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar pb-4">
        {!isCollapsed && filteredFeedbacks.length > 0 && (
          <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Past Analyses
          </div>
        )}

        <AnimatePresence>
          {filteredFeedbacks.map((feedback) => {
            const isActive = feedback.id === currentId;
            return (
              <Link
                key={feedback.id}
                href={`/analytics/${feedback.id}`}
                className={`group relative flex items-start gap-3 rounded-xl transition-all duration-200 border border-transparent ${
                  isActive 
                    ? "bg-white border-gray-200 shadow-sm" 
                    : "hover:bg-white hover:border-gray-200"
                } ${isCollapsed ? "justify-center p-3 my-2" : "p-3 mx-2 my-1"}`}
              >
                {!isCollapsed ? (
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                       <h3 className={`text-sm font-semibold truncate leading-tight ${isActive ? "text-black" : "text-gray-600 group-hover:text-black"}`}>
                        {feedback.jobTitle}
                      </h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getScoreColor(feedback.matchScore)}`}>
                         {feedback.matchScore}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 font-medium truncate mb-1">
                      {feedback.company}
                    </p>
                    
                    <p className="text-[10px] text-gray-400">
                      {feedback.date}
                    </p>
                  </div>
                ) : (
                  <div className="relative flex justify-center w-full">
                     <FileText className={`w-5 h-5 ${isActive ? "text-black" : "text-gray-400"}`} />
                     {isCollapsed && isActive && <div className="absolute -right-3 top-0 w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                )}
                
                {isCollapsed && (
                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-black text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-200 min-w-[150px]">
                    <p className="font-semibold mb-0.5 truncate">{feedback.jobTitle}</p>
                    <p className="text-gray-500 font-medium text-[10px] mb-1">{feedback.company}</p>
                     <div className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${getScoreColor(feedback.matchScore)}`}>
                         Score: {feedback.matchScore}
                      </div>
                  </div>
                )}
              </Link>
            );
          })}
        </AnimatePresence>
        
        {filteredFeedbacks.length === 0 && !isCollapsed && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
             <p className="text-sm font-medium">No reports found</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
