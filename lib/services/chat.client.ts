import type { ChatHistoryEntry, ChatShareMessage, ChatSource } from "@/lib/types/chat"
import { CHAT_SOURCE_DELIMITER } from "@/lib/types/chat"

export async function streamChatMessage({
  conversationId,
  prompt,
  conversationHistory,
  signal,
  onUpdate,
}: {
  conversationId: string
  prompt: string
  conversationHistory: ChatHistoryEntry[]
  signal?: AbortSignal
  onUpdate: (content: string) => void
}) {
  const res = await fetch("/api/chat/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversationId,
      prompt,
      conversationHistory,
    }),
    signal,
  })

  if (!res.ok || !res.body) {
    const text = await res.text()
    throw new Error(text || "Chat request failed")
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  let parsingSources = false
  let jsonPart = ""
  let textPart = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)

    if (parsingSources) {
      jsonPart += chunk
    } else {
      const parts = chunk.split(CHAT_SOURCE_DELIMITER)
      if (parts.length > 1) {
        textPart += parts[0]
        jsonPart += parts[1]
        parsingSources = true
        onUpdate(textPart)
      } else {
        textPart += chunk
        onUpdate(textPart)
      }
    }
  }

  let sources: ChatSource[] = []
  if (jsonPart) {
    try {
      sources = JSON.parse(jsonPart) as ChatSource[]
    } catch (error) {
      console.error("Failed to parse sources JSON:", error)
    }
  }

  return { text: textPart, sources }
}

export async function shareChat({
  conversationId,
  title,
  messages,
}: {
  conversationId: string
  title: string
  messages: ChatShareMessage[]
}) {
  const res = await fetch("/api/chat/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, title, messages }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || "Share failed")
  }

  const { token } = await res.json()
  return token as string
}
