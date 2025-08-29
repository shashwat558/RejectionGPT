"use client"

import { useState } from "react"
import { Copy, RotateCcw, ThumbsUp, ThumbsDown, User, Bot } from "lucide-react";
import {motion} from "framer-motion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {vscDarkPlus} from "react-syntax-highlighter/dist/esm/styles/prism"

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
          isUser ? "bg-[#333] text-gray-300" : "border-[1px] text-white"
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
          <motion.div initial={{opacity:0}} animate={{opacity: 1}} transition={{duration: 0.3}}  className="text-md leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
            <Markdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code(props) {
                const {children, className, node, ...rest} = props;
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <SyntaxHighlighter 
                  {...rest}
                  preTag="div"
                  // eslint-disable-next-line react/no-children-prop
                  children={String(children)}
                  language = {match[1]}
                  style= {vscDarkPlus}
                  >
                  </SyntaxHighlighter>
                ) : (
                  <code {...rest} className={className}>
                    {children}
                  </code>
                )
              }
            }}
            >{message.content}</Markdown></motion.div>
            
        </div>

        
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
