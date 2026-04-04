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
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-white border-l border-r border-gray-200">
      <div className="border-b border-gray-200 bg-white px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link href="/analytics" className="flex items-center gap-2 font-medium text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="flex items-center gap-3">
            <LoadingButton
              onClick={handleShare}
              isLoading={isSharing}
              loadingText="Creating..."
              className="px-4 py-2 rounded-lg border border-gray-200 text-black text-sm font-medium hover:bg-gray-50 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              {linkCopied ? "Copied!" : "Share"}
            </LoadingButton>

            {!isCalendarConnected ? (
              <Button
                variant="outline"
                onClick={() => {
                  router.push("/api/calender/connect")
                }}
                className="bg-black text-white hover:bg-gray-800 transition-colors shadow-sm"
              >
                Connect Calendar
              </Button>
            ) : (
              <button
                onClick={() => {
                  router.push("/api/calender/connect")
                }}
                className="flex items-center gap-2 border border-green-200 bg-green-50 px-3 py-2 rounded-lg text-sm text-green-700 font-medium"
              >
                Calendar Connected <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black">
                {conversation?.title || "Untitled chat"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Keep memory, tags, and pinned messages aligned to this conversation.
              </p>
            </div>
            <button
              onClick={() => setShowMemory((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-black font-medium text-sm hover:bg-gray-50 shadow-sm transition-colors"
            >
              Memory
              <ChevronDown className={`w-4 h-4 transition-transform ${showMemory ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-black bg-gray-100 rounded-lg px-3 py-1.5"
              >
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                {tag}
                <button onClick={() => removeTag(conversationId, tag)} className="text-gray-400 hover:text-red-500 ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            <div className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
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
                className="bg-transparent text-sm w-20 text-black placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {showMemory && (
            <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Conversation Memory</label>
              <textarea
                value={memory}
                onChange={(e) => setMemory(conversationId, e.target.value)}
                placeholder="Examples: preferred tone, target role, constraints, key objectives"
                className="mt-2 w-full min-h-[80px] bg-transparent text-sm text-black placeholder-gray-400 focus:outline-none resize-y"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-gray-50/50">
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

      <div className="border-t border-gray-200 bg-white">
        <QuickActions onActionClick={handleQuickAction} />
      </div>

      {errorMessage && (
        <div className="px-6 pt-4 bg-white">
          <ErrorState message={errorMessage} />
        </div>
      )}

      <div className="px-6 py-5 bg-white">
        <div className="max-w-4xl mx-auto relative mt-2">
          <div className="flex items-end gap-3 bg-white border border-gray-300 shadow-sm rounded-2xl p-2.5 focus-within:ring-2 focus-within:ring-black focus-within:border-black transition-all">
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black transition-colors shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about resumes, job search, or interview prep..."
              className="flex-1 bg-transparent text-black placeholder-gray-400 resize-none py-2 focus:outline-none min-h-[40px] max-h-48"
              rows={1}
              style={{
                height: "auto",
                minHeight: "40px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = target.scrollHeight + "px"
              }}
            />

            <div className="flex items-center gap-1.5 shrink-0">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black transition-colors">
                <Mic className="w-5 h-5" />
              </button>

              {isLoading ? (
                <button
                  onClick={handleStop}
                  className="p-2 rounded-lg bg-gray-100 text-black hover:bg-gray-200 transition-colors"
                >
                  <StopCircle className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-3">
          <p className="text-gray-400 text-xs">AI can make mistakes. Consider checking important information.</p>
        </div>
      </div>
    </div>
  )
}
