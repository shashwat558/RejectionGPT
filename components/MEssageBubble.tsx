"use client"

import { useState } from "react"
import { Copy, RotateCcw, ThumbsUp, ThumbsDown, Link as LinkIcon, Pin } from "lucide-react"
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
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => actionsEnabled && setShowActions(true)}
      onMouseLeave={() => actionsEnabled && setShowActions(false)}
    >
      <div className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-xs text-gray-300">
        {isUser ? "YOU" : "AI"}
      </div>

      <div className={`flex flex-col max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 border ${
            isUser
              ? "bg-white/5 text-gray-200 border-white/10"
              : "bg-black/20 text-gray-200 border-white/10"
          } ${isPinned ? "ring-1 ring-white/30" : ""}`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-[15px] leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none prose-invert"
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
                    <code className={className}>{children}</code>
                  )
                },
                a(props) {
                  const { children, href } = props
                  return (
                    <a className="text-gray-200 underline decoration-white/30" href={href} target="_blank" rel="noreferrer">
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
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleString([], {
              year: "numeric",
              month: "short",
              day: "2-digit",
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
                className="flex items-center gap-1 text-xs text-gray-200 hover:underline hover:text-white"
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
              className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-gray-200 transition-colors"
              title="Copy message"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {!isUser && (
              <button
                onClick={() => onRegenerate?.(message.id)}
                className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-gray-200 transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onPin?.(message.id)}
              className={`p-1.5 rounded-md transition-colors ${
                isPinned ? "bg-white/10 text-gray-200" : "hover:bg-white/10 text-gray-500 hover:text-gray-200"
              }`}
              title={isPinned ? "Unpin message" : "Pin message"}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-gray-200 transition-colors"
              title="Good response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-gray-200 transition-colors"
              title="Bad response"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Copy feedback */}
        {copied && <div className="text-xs text-gray-200 mt-1">Copied to clipboard!</div>}
      </div>
    </div>
  )
}
