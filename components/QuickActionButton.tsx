"use client"

import { FileText, Briefcase, Target, MessageSquare } from "lucide-react"

interface QuickActionsProps {
  onActionClick: (action: string) => void
}

export default function QuickActions({ onActionClick }: QuickActionsProps) {
  const quickActions = [
    {
      icon: <FileText className="w-4 h-4" />,
      label: "Review my resume",
      action: "Can you review my resume and provide feedback on how to improve it?",
    },
    {
      icon: <Briefcase className="w-4 h-4" />,
      label: "Job search tips",
      action: "What are the best strategies for finding job opportunities in tech?",
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: "Interview prep",
      action: "Help me prepare for a technical interview. What should I focus on?",
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: "Cover letter",
      action: "How do I write an effective cover letter that stands out?",
    },
  ]

  return (
    <div className="px-4 py-2">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {quickActions.map((item, index) => (
          <button
            key={index}
            onClick={() => onActionClick(item.action)}
            className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] border border-[#383838] rounded-lg text-gray-300 hover:bg-[#333] hover:border-[#444] transition-colors whitespace-nowrap text-sm"
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
