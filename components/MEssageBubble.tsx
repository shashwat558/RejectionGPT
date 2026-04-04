"use client"

import { useState } from "react"
import { Copy, RotateCcw, ThumbsUp, ThumbsDown, Link as LinkIcon, Pin, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import type { ChatSource } from "@/lib/types/chat"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isTyping?: boolean
  sources?: ChatSource[]
}

interface MessageBubbleProps {
  message: Message
  onRegenerate?: (messageId: string) => void
  onCopy?: (content: string) => void
  onPin?: (messageId: string) => void
  isPinned?: boolean
  actionsEnabled?: boolean
}

export default function MessageBubble({
  message,
  onRegenerate,
  onCopy,
  onPin,
  isPinned,
  actionsEnabled = true,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy?.(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = message.role === "user"

  return (
    <div
      className={`flex gap-3 w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => actionsEnabled && setShowActions(true)}
      onMouseLeave={() => actionsEnabled && setShowActions(false)}
    >
      <div className={`w-9 h-9 rounded-full flex items-center shrink-0 justify-center text-[10px] font-bold tracking-wider shadow-sm ${isUser ? 'bg-black text-white' : 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'}`}>
        {isUser ? "YOU" : <Sparkles className="w-4 h-4 text-white" />}
      </div>

      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-5 py-4 ${
            isUser
              ? "bg-black text-white shadow-md rounded-tr-sm"
              : "bg-white border border-gray-100 shadow-sm rounded-tl-sm text-gray-800"
          } ${isPinned ? "ring-2 ring-black" : ""}`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-[15px] leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none prose-gray"
          >
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { children, className } = props
                  const match = /language-(\w+)/.exec(className || "")
                  return match ? (
                    <SyntaxHighlighter
                      PreTag="div"
                      // eslint-disable-next-line react/no-children-prop
                      children={String(children)}
                      language={match[1]}
                      style={vscDarkPlus}
                    />
                  ) : (
                    <code className="bg-gray-100 text-black px-1.5 py-0.5 rounded text-sm">{children}</code>
                  )
                },
                a(props) {
                  const { children, href } = props
                  return (
                    <a className="text-black font-medium underline decoration-gray-300 hover:decoration-black transition-colors" href={href} target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  )
                },
              }}
            >
              {message.content}
            </Markdown>
          </motion.div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[11px] text-gray-400 font-medium">
            {new Date(message.timestamp).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.sources.map((src, idx) => (
              <a
                key={idx}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
              >
                <LinkIcon className="w-3 h-3" />
                {src.title}
              </a>
            ))}
          </div>
        )}

        
        {showActions && actionsEnabled && (
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
              title="Copy message"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {!isUser && (
              <button
                onClick={() => onRegenerate?.(message.id)}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onPin?.(message.id)}
              className={`p-1.5 rounded-md transition-colors ${
                isPinned ? "bg-gray-100 text-black" : "hover:bg-gray-100 text-gray-400 hover:text-black"
              }`}
              title={isPinned ? "Unpin message" : "Pin message"}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
              title="Good response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
              title="Bad response"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Copy feedback */}
        {copied && <div className="text-[11px] font-medium text-black mt-1 bg-gray-100 px-2 py-0.5 rounded">Copied!</div>}
      </div>
    </div>
  )
}
