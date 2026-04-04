"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { motion } from "framer-motion"

interface FeedbackSectionProps {
  title: string
  items: string[]
  icon: React.ReactNode
  color: string
}

export default function FeedbackSection({ title, items, icon, color }: FeedbackSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5 shadow-sm transition-all hover:border-gray-300">
      <div className="flex justify-between items-center cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <div className={`${color.replace("text-", "bg-").replace("500", "100")} text-${color.includes("-") ? color.split("-")[1] : "blue"}-600 rounded-lg p-2`}>{icon}</div>
          <h3 className="text-black font-semibold tracking-tight">{title}</h3>
          <div className="text-gray-400 text-xs font-semibold bg-gray-50 px-2 py-0.5 rounded-full ml-1">{items.length ?? 0}</div>
        </div>
        <button className="text-gray-400 group-hover:text-black transition-colors rounded-full hover:bg-gray-50 p-1">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-5 pt-4 border-t border-gray-100"
        >
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li key={index} className="text-gray-600 flex gap-3 items-start leading-relaxed text-sm">
                <div className="min-w-[12px] mt-1.5 flex items-center justify-center">
                  <div className={`w-1.5 h-1.5 rounded-full bg-black opacity-30`}></div>
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}
