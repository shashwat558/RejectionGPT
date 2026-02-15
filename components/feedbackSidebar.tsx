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
    if (numeric >= 70) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (numeric >= 40) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 320 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`h-screen hidden xl:flex flex-col border-r border-[#1a1a1a] bg-[#09090b] relative z-20 shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 mb-2 border-b border-[#1a1a1a]/50">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <LayoutGrid className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-gray-200 tracking-tight">History</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors ml-auto"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-5 mb-4">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-pink-500 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#2a2a2a] rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:bg-[#1a1a1a] focus:ring-1 focus:ring-pink-500/50 transition-all"
            />
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
        {!isCollapsed && filteredFeedbacks.length > 0 && (
          <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-600 tracking-wider">
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
                    ? "bg-[#18181b] border-[#27272a] shadow-sm" 
                    : "hover:bg-[#121212] hover:border-[#1a1a1a]"
                } ${isCollapsed ? "justify-center p-3 my-2" : "p-3 mx-2 my-1"}`}
              >
                {!isCollapsed ? (
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                       <h3 className={`text-sm font-medium truncate leading-tight ${isActive ? "text-gray-100" : "text-gray-400 group-hover:text-gray-300"}`}>
                        {feedback.jobTitle}
                      </h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getScoreColor(feedback.matchScore)}`}>
                         {feedback.matchScore}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate mb-1">
                      {feedback.company}
                    </p>
                    
                    <p className="text-[10px] text-gray-600">
                      {feedback.date}
                    </p>
                  </div>
                ) : (
                  <div className="relative flex justify-center w-full">
                     <FileText className={`w-5 h-5 ${isActive ? "text-pink-500" : "text-gray-600"}`} />
                     {isCollapsed && isActive && <div className="absolute -right-3 top-0 w-1.5 h-1.5 rounded-full bg-pink-500" />}
                  </div>
                )}
                
                {isCollapsed && (
                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-gray-900/90 backdrop-blur-md text-gray-200 text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10 min-w-[150px]">
                    <p className="font-medium text-white mb-0.5 truncate">{feedback.jobTitle}</p>
                    <p className="text-gray-500 text-[10px] mb-1">{feedback.company}</p>
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
          <div className="flex flex-col items-center justify-center py-12 text-gray-600 gap-2">
             <p className="text-sm">No reports found</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
