"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, MessageSquare, Search, MoreHorizontal, ChevronLeft } from "lucide-react"

interface ChatHistory {
  id: string
  title: string
  lastMessage: string
  timestamp: string
}

export default function ChatSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const chatHistory: ChatHistory[] = [
    {
      id: "1",
      title: "Resume Review Session",
      lastMessage: "Thanks for the feedback on my resume structure...",
      timestamp: "Today",
    },
    {
      id: "2",
      title: "Interview Preparation",
      lastMessage: "What are common behavioral interview questions?",
      timestamp: "Yesterday",
    },
    {
      id: "3",
      title: "Job Search Strategy",
      lastMessage: "Help me create a job search plan for frontend roles",
      timestamp: "2 days ago",
    },
    {
      id: "4",
      title: "Cover Letter Writing",
      lastMessage: "Can you help me write a cover letter for...",
      timestamp: "1 week ago",
    },
  ]

  const filteredChats = chatHistory.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div
      className={`h-full flex flex-col border-r border-[#383838] bg-[#252525] transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-[#383838]">
        {!isCollapsed && (
          <Link href="/" className="flex items-center text-gray-400 hover:text-gray-300 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="text-sm">Back</span>
          </Link>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md bg-[#333] text-gray-400 hover:text-gray-300 transition-colors ml-auto"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>

      
      <div className="p-3">
        <button
          className={`w-full flex items-center justify-center gap-2 py-2 bg-[#333] hover:bg-[#444] text-gray-300 rounded-md text-sm transition-colors ${
            isCollapsed ? "px-0" : "px-3"
          }`}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      
      {!isCollapsed && (
        <div className="px-3 mb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#2a2a2a] border border-[#383838] rounded-md text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#444]"
            />
          </div>
        </div>
      )}

      
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`group relative ${isCollapsed ? "px-3 py-3" : "px-3 py-2"} mb-1 mx-2 rounded-md hover:bg-[#2a2a2a] cursor-pointer transition-colors`}
          >
            {isCollapsed ? (
              <div className="flex justify-center">
                <MessageSquare className="w-5 h-5 text-gray-400" />
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-gray-300 text-sm font-medium truncate max-w-[150px]">{chat.title}</h3>
                  <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#333] transition-all">
                    <MoreHorizontal className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
                <p className="text-gray-500 text-xs truncate">{chat.lastMessage}</p>
                <span className="text-gray-600 text-xs">{chat.timestamp}</span>
              </div>
            )}
          </div>
        ))}

        {filteredChats.length === 0 && !isCollapsed && (
          <div className="text-center py-8 text-gray-500 text-sm">No chats found</div>
        )}
      </div>

      
      <div className="p-3 border-t border-[#383838]">
        <div className={`flex items-center gap-2 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center">
            <span className="text-gray-300 text-xs">U</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-gray-300 text-sm">User</p>
              <p className="text-gray-500 text-xs">Free Plan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
