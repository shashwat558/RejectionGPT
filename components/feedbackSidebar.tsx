"use client"

import { useState } from "react"
import Link from "next/link"

import { ChevronLeft, ChevronRight, FileText, Clock, Search, Plus } from "lucide-react"

export interface FeedbackItem {
  id: string
  jobTitle: string
  company: string
  date: string
  matchScore: string
}

interface FeedbackSidebarProps {
  feedbacks: FeedbackItem[]
  currentId: string
}

export default function FeedbackSidebar({ feedbacks, currentId }: FeedbackSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  

  const filteredFeedbacks = feedbacks.filter(
    (feedback) =>
      (feedback.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (feedback.company || "").toLowerCase().includes(searchQuery.toLowerCase())
   )

  const getScoreColor = (score: string) => {
  const numeric = parseInt(score.replace("%", ""));
  const clamped = Math.max(0, Math.min(numeric, 100));
  
  const hue = (clamped * 1.2);

  return `bg-[hsl(${hue},70%,20%)] text-[hsl(${hue},70%,60%)]`;
};
  return (
    <div
      className={`h-screen flex flex-col  border-r-[1px] rounded-md border-t-[1px]  border-[#7c7b7b] bg-[#1e1e1e] transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      
      <div className="flex items-center justify-between p-4 border-b border-[#383838]">
        {!isCollapsed && <h2 className="text-gray-300 font-medium">Feedback History</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md bg-[#333] text-gray-400 hover:text-gray-300 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

     
      {!isCollapsed && (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search feedbacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#252525] border border-[#383838] rounded-md text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#444]"
            />
          </div>
        </div>
      )}

      
      <div className="flex-1 overflow-y-auto py-2">
        {filteredFeedbacks.map((feedback) => (
          <Link
            key={feedback.id}
            href={`/analytics/${feedback.id}`}
            className={`block ${isCollapsed ? "px-3 py-3" : "px-3 py-2.5"} mb-1 mx-2 rounded-md transition-colors ${
              feedback.id === currentId
                ? "bg-[#333] text-gray-200"
                : "text-gray-400 hover:bg-[#252525] hover:text-gray-300"
            }`}
          >
            {isCollapsed ? (
              <div className="flex justify-center">
                <FileText className="w-5 h-5" />
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-sm truncate max-w-[150px]">{feedback.jobTitle}</div>
                  <div className={`text-xs px-1.5 py-0.5 rounded-full ${getScoreColor(feedback.matchScore)}`}>
                    {feedback.matchScore}
                  </div>
                </div>
                <div className="text-xs text-gray-500 truncate">{feedback.company}</div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {feedback.date}
                </div>
              </div>
            )}
          </Link>
        ))}

        {filteredFeedbacks.length === 0 && !isCollapsed && (
          <div className="text-center py-8 text-gray-500 text-sm">No matching feedbacks found</div>
        )}
      </div>

     
      <div className="p-3 border-t border-[#383838]">
        <Link
          href="/"
          className={`flex items-center justify-center gap-2 w-full py-2 bg-[#333] hover:bg-[#444] text-gray-300 rounded-md text-sm transition-colors ${
            isCollapsed ? "px-0" : "px-3"
          }`}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>New Analysis</span>}
        </Link>
      </div>
    </div>
  )
}