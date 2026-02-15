"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Plus, MessageSquare, Search, ChevronLeft, MoreHorizontal } from "lucide-react"
import { useChatMeta } from "@/stores/chatMetaStore"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

const formatTimestamp = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  
  if (new Date().toDateString() === date.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

export default function ChatSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const conversations = useChatMeta((state) => state.conversations)
  const pathname = usePathname()

  const conversationList = useMemo(() => {
    return Object.values(conversations).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [conversations])

  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return conversationList
    return conversationList.filter((chat) => {
      return (
        chat.title.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query) ||
        (chat.tags && chat.tags.some((tag) => tag.toLowerCase().includes(query))) ||
        (chat.memory && chat.memory.toLowerCase().includes(query))
      )
    })
  }, [conversationList, searchQuery])

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 320 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full flex flex-col border-r border-[#1a1a1a] bg-[#09090b] relative z-20 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 mb-2 border-b border-[#1a1a1a]/50">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 overflow-hidden"
            >
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/20 shrink-0">
                <MessageSquare className="w-4 h-4 text-pink-500" />
              </div>
              <span className="font-semibold text-gray-200 tracking-tight whitespace-nowrap">RejectionGPT</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 ml-auto rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors"
        >
          {isCollapsed ? <ChevronLeft className="w-5 h-5 rotate-180" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Action Area */}
      <div className="px-5 my-6 space-y-4">
        <Link
          href="/analytics"
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-600 text-white font-medium shadow-lg shadow-pink-900/20 hover:shadow-pink-900/40 hover:scale-[1.02] transition-all active:scale-95 ${
            isCollapsed ? "px-0" : "px-4"
          }`}
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span className="whitespace-nowrap">New Chat</span>}
        </Link>
        
        {!isCollapsed && (
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-pink-500 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#2a2a2a] rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:bg-[#1a1a1a] focus:ring-1 focus:ring-pink-500/50 transition-all"
            />
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
        {!isCollapsed && filteredChats.length > 0 && (
          <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-600 tracking-wider">
            Your Conversations
          </div>
        )}

        <AnimatePresence>
          {filteredChats.map((chat) => {
             const isActive = pathname === `/chat/${chat.id}`;
             return (
            <Link
              href={`/chat/${chat.id}`}
              key={chat.id}
              className={`group relative flex items-start gap-3 rounded-xl transition-all duration-200 border border-transparent ${
                isActive 
                  ? "bg-[#18181b] border-[#27272a] shadow-sm" 
                  : "hover:bg-[#121212] hover:border-[#1a1a1a]"
              } ${isCollapsed ? "justify-center p-3 my-2" : "p-3 mx-2 my-1"}`}
            >
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`text-sm font-medium truncate ${isActive ? "text-gray-100" : "text-gray-400 group-hover:text-gray-300"}`}>
                      {chat.title || "New Conversation"}
                    </h3>
                    <span className="text-[10px] text-gray-600 whitespace-nowrap ml-2">
                       {formatTimestamp(chat.updatedAt)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 truncate h-4 mb-2">
                    {chat.lastMessage || "No messages yet"}
                  </p>
                  
                  {chat.tags && chat.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {chat.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#1a1a1a] text-gray-500 border border-[#27272a]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {isCollapsed && (
                 <div className={`w-2 h-2 rounded-full mt-1.5 ${isActive ? "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]" : "bg-gray-700 group-hover:bg-gray-500"}`} />
              )}

             {isCollapsed && (
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-gray-900/90 backdrop-blur-md text-gray-200 text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
                  <p className="font-medium text-white mb-0.5">{chat.title}</p>
                  <p className="text-gray-500 text-[10px]">{formatTimestamp(chat.updatedAt)}</p>
                </div>
              )}
            </Link>
          )})}
        </AnimatePresence>

        {filteredChats.length === 0 && !isCollapsed && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600 gap-3">
            <MessageSquare className="w-10 h-10 opacity-10" />
            <p className="text-sm font-medium">No conversations found</p>
            <p className="text-xs text-center max-w-[180px]">Start a new chat to begin practicing your interviews.</p>
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#1a1a1a] bg-[#09090b]">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-[#1a1a1a] overflow-hidden">
             <span className="text-white font-bold text-sm">S</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2">
                 <p className="text-sm font-medium text-gray-200 truncate">Shashwat</p>
                 <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20">PRO</span>
               </div>
              <p className="text-xs text-gray-500 truncate">shashwat@example.com</p>
            </div>
          )}
          {!isCollapsed && (
            <button className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
