"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import {
  Send,
  Paperclip,
  Mic,
  ArrowLeft,
  Check,
  Share2,
  Tag,
  X,
  ChevronDown,
  StopCircle,
} from "lucide-react"
import MessageBubble from "./MEssageBubble"
import TypingIndicator from "./typingIndicator"
import QuickActions from "./QuickActionButton"
import { useMessages } from "@/stores/messageStore"
import { useChatMeta } from "@/stores/chatMetaStore"
import { useShallow } from "zustand/react/shallow"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { useAuth } from "@/stores/useAuth"
import LoadingButton from "@/components/ui/loading-button"
import ErrorState from "@/components/ui/error-state"
import { streamChatMessage, shareChat } from "@/lib/services/chat.client"
import { fetchCalendarStatus } from "@/lib/services/calendar.client"
import type { ChatHistoryEntry, ChatSource } from "@/lib/types/chat"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isTyping?: boolean
  sources?: ChatSource[]
}

const buildConversationTitle = (input: string) => {
  const words = input.trim().split(/\s+/).slice(0, 6)
  return words.length > 0 ? words.join(" ") : "Untitled chat"
}

const toHistory = (items: Message[]): ChatHistoryEntry[] =>
  items.map((m) => ({
    role: (m.role === "assistant" ? "model" : "user") as ChatHistoryEntry["role"],
    parts: [{ text: m.content }],
  }))

export default function ChatInterface({ conversationId }: { conversationId: string }) {
  const { messages, setMessages } = useMessages()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)
  const [showMemory, setShowMemory] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  const {
    ensureConversation,
    upsertConversation,
    addTag,
    removeTag,
    setMemory,
    togglePinnedMessage,
    conversation,
  } = useChatMeta(
    useShallow((state) => ({
      ensureConversation: state.ensureConversation,
      upsertConversation: state.upsertConversation,
      addTag: state.addTag,
      removeTag: state.removeTag,
      setMemory: state.setMemory,
      togglePinnedMessage: state.togglePinnedMessage,
      conversation: state.conversations[conversationId],
    }))
  )

  const tags = conversation?.tags ?? []
  const memory = conversation?.memory ?? ""
  const pinnedMessageIds = conversation?.pinnedMessageIds ?? []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    ensureConversation(conversationId)
  }, [conversationId, ensureConversation])

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (user) {
          const isConnected = await fetchCalendarStatus()
          setIsCalendarConnected(isConnected)
        }
      } catch (error) {
        console.error("Error checking calendar connection:", error)
      }
    }
    checkConnection()
  }, [user])

  useEffect(() => {
    useMessages?.persist.setOptions({
      name: conversationId,
    })

    useMessages.persist.rehydrate()
    localStorage.removeItem("messages-storage")
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    return () => abortControllerRef.current?.abort()
  }, [])

  const updateConversationMeta = (partial: { title?: string; lastMessage?: string }) => {
    upsertConversation({
      id: conversationId,
      ...partial,
      updatedAt: new Date().toISOString(),
    })
  }

  const buildRecentHistory = (historyMessages: Message[]): ChatHistoryEntry[] => {
    const MAX_CONTENT = 6
    const coreHistory = toHistory(historyMessages)
    const memoryText = memory.trim()
    const memoryEntry: ChatHistoryEntry[] = memoryText
      ? [{ role: "user", parts: [{ text: `Context memory:\n${memoryText}` }] }]
      : []

    const recent = coreHistory.slice(-MAX_CONTENT)
    return [...memoryEntry, ...recent]
  }

  const updateAssistantContent = (messageId: string, content: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg.id === messageId ? { ...msg, content } : msg))
    )
  }

  const finalizeAssistantMessage = (messageId: string, content: string, sources?: Message["sources"]) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, content, sources, isTyping: false } : { ...msg, isTyping: false }
      )
    )
  }

  const runChatStream = async ({
    promptText,
    historyMessages,
    assistantMessageId,
  }: {
    promptText: string
    historyMessages: Message[]
    assistantMessageId: string
  }) => {
    setIsLoading(true)
    setErrorMessage(null)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const { text, sources } = await streamChatMessage({
        conversationId,
        prompt: promptText,
        conversationHistory: buildRecentHistory(historyMessages),
        signal: controller.signal,
        onUpdate: (content) => updateAssistantContent(assistantMessageId, content),
      })

      finalizeAssistantMessage(assistantMessageId, text, sources)
      updateConversationMeta({ lastMessage: text || promptText })
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Chat send failed:", error)
        setErrorMessage("We couldn't send that message. Please try again.")
      }
      finalizeAssistantMessage(assistantMessageId, "", undefined)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!conversation || conversation.title === "Untitled chat") {
      updateConversationMeta({ title: buildConversationTitle(input) })
    }
    updateConversationMeta({ lastMessage: input })

    setInput("")

    const assistantMessage: Message = {
      id: "ai-" + Date.now().toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isTyping: true,
    }

    setMessages((prev) => [...prev, assistantMessage])

    await runChatStream({
      promptText: input,
      historyMessages: [...messages, userMessage],
      assistantMessageId: assistantMessage.id,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (action: string) => {
    setInput(action)
    textareaRef.current?.focus()
  }

  const regenerateResponse = async (messageId: string) => {
    const assistantMessageIndex = messages.findIndex((msg) => msg.id === messageId)
    if (assistantMessageIndex === -1) return

    const userMessage = messages[assistantMessageIndex - 1]
    if (!userMessage || userMessage.role !== "user") return

    setMessages((prev) => prev.slice(0, assistantMessageIndex))

    setInput(userMessage.content)

    const newAssistantMessage: Message = {
      id: "ai-" + Date.now().toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isTyping: true,
    }

    setMessages((prev) => [...prev, newAssistantMessage])

    await runChatStream({
      promptText: userMessage.content,
      historyMessages: [...messages.slice(0, assistantMessageIndex), userMessage],
      assistantMessageId: newAssistantMessage.id,
    })
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleStop = () => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg.isTyping ? { ...msg, isTyping: false } : msg))
    )
  }

  const handleTagSubmit = () => {
    if (!tagInput.trim()) return
    addTag(conversationId, tagInput)
    setTagInput("")
  }

  const handleShare = async () => {
    try {
      setIsSharing(true)
      setErrorMessage(null)
      const token = await shareChat({
        conversationId,
        title: conversation?.title || "Untitled chat",
        messages: messages.map((message) => ({
          ...message,
          timestamp: new Date(message.timestamp).toISOString(),
        })),
      })
      const origin = window.location.origin
      await navigator.clipboard.writeText(`${origin}/share/${token}`)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      console.error("Share failed:", error)
      setErrorMessage("Unable to share this chat. Please try again.")
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="my-container flex flex-col h-full w-full max-w-5xl">
      <div className="border-b border-white/10 bg-black/20 backdrop-blur px-5 py-4">
        <div className="flex items-center justify-between">
          <Link href="/analytics" className="flex items-center gap-2 text-gray-400 hover:text-gray-200">
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </Link>

          <div className="flex items-center gap-2">
            <LoadingButton
              onClick={handleShare}
              isLoading={isSharing}
              loadingText="Creating..."
              className="px-3 py-2 rounded-md border border-white/10 text-gray-200 text-xs hover:bg-white/10"
            >
              <Share2 className="w-3.5 h-3.5" />
              {linkCopied ? "Link Copied" : "Share"}
            </LoadingButton>

            {!isCalendarConnected ? (
              <Button
                variant="outline"
                onClick={() => {
                  router.push("/api/calender/connect")
                }}
                className="bg-white text-black border-white hover:bg-gray-200 transition-colors"
              >
                Connect Calendar
              </Button>
            ) : (
              <button
                onClick={() => {
                  router.push("/api/calender/connect")
                }}
                className="flex items-center gap-2 border border-white/20 px-3 py-2 rounded-md text-xs bg-transparent text-gray-200"
              >
                Calendar Connected <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-100">
                {conversation?.title || "Untitled chat"}
              </h1>
              <p className="text-xs text-gray-500">
                Keep memory, tags, and pinned messages aligned to this conversation.
              </p>
            </div>
            <button
              onClick={() => setShowMemory((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 text-gray-200 text-xs hover:bg-white/10"
            >
              Memory
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMemory ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 text-xs text-gray-200 border border-white/10 rounded-full px-3 py-1"
              >
                <Tag className="w-3.5 h-3.5" />
                {tag}
                <button onClick={() => removeTag(conversationId, tag)} className="text-gray-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            <div className="flex items-center gap-2 border border-dashed border-white/10 rounded-full px-3 py-1">
              <Tag className="w-3.5 h-3.5 text-gray-500" />
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleTagSubmit()
                  }
                }}
                placeholder="Add tag"
                className="bg-transparent text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          {showMemory && (
            <div className="border border-white/10 rounded-xl bg-black/20 p-3">
              <label className="text-xs text-gray-400">Conversation memory (auto-injected into prompts)</label>
              <textarea
                value={memory}
                onChange={(e) => setMemory(conversationId, e.target.value)}
                placeholder="Examples: preferred tone, target role, constraints, key objectives"
                className="mt-2 w-full min-h-[80px] bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRegenerate={regenerateResponse}
            onCopy={copyMessage}
            onPin={(messageId) => togglePinnedMessage(conversationId, messageId)}
            isPinned={pinnedMessageIds.includes(message.id)}
          />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/10 bg-black/20">
        <QuickActions onActionClick={handleQuickAction} />
      </div>

      {errorMessage && (
        <div className="px-5 pt-4">
          <ErrorState message={errorMessage} />
        </div>
      )}

      <div className="px-5 py-4 border-t border-white/10 bg-black/30">
        <div className="relative">
          <div className="flex items-end gap-3 bg-black/40 border border-white/10 rounded-2xl p-3">
            <button className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about resumes, job search, or interview prep..."
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 resize-none focus:outline-none min-h-[20px] max-h-32"
              rows={1}
              style={{
                height: "auto",
                minHeight: "20px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = target.scrollHeight + "px"
              }}
            />

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors">
                <Mic className="w-4 h-4" />
              </button>

              {isLoading ? (
                <button
                  onClick={handleStop}
                  className="p-2 rounded-md border border-white/10 hover:bg-white/10 text-gray-200 transition-colors"
                >
                  <StopCircle className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 rounded-md bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-2">
          <p className="text-gray-500 text-xs">AI can make mistakes. Consider checking important information.</p>
        </div>
      </div>
    </div>
  )
}
