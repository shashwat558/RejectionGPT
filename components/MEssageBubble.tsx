"use client"

import { useState } from "react"
import { Copy, RotateCcw, ThumbsUp, ThumbsDown, User, Bot } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface MessageBubbleProps {
  message: Message
  onRegenerate: (messageId: string) => void
  onCopy: (content: string) => void
}

export default function MessageBubble({ message, onRegenerate, onCopy }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = message.role === "user"

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
     
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-[#333] text-gray-300" : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

     
      <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-xl px-4 py-3 ${
            isUser ? "bg-[#333] text-gray-200" : "bg-[#2a2a2a] border border-[#383838] text-gray-300"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}</p>
        </div>

        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleString([], { hour: "2-digit", minute: "2-digit" })}
            hi
          </span>
        </div>

       
        {showActions && !isUser && (
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-[#333] text-gray-500 hover:text-gray-300 transition-colors"
              title="Copy message"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onRegenerate(message.id)}
              className="p-1.5 rounded-md hover:bg-[#333] text-gray-500 hover:text-gray-300 transition-colors"
              title="Regenerate response"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-[#333] text-gray-500 hover:text-gray-300 transition-colors"
              title="Good response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-[#333] text-gray-500 hover:text-gray-300 transition-colors"
              title="Bad response"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {copied && <div className="text-xs text-green-400 mt-1">Copied to clipboard!</div>}
      </div>
    </div>
  )
}
