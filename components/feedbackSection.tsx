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
    <div className="bg-[#252525] rounded-lg border border-[#383838] p-5 mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <div className={`${color} rounded-full p-1`}>{icon}</div>
          <h3 className="text-gray-300 font-semibold">{title}</h3>
          <div className="text-gray-500 text-sm ml-2">({items.length})</div>
        </div>
        <button className="text-gray-400 hover:text-gray-300">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="text-gray-400 flex gap-2 items-start">
                <div className="min-w-[20px] mt-1">
                  <div className={`w-2 h-2 rounded-full ${color.replace("text-", "bg-")} mt-1`}></div>
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
