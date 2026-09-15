import type { ChatShareMessage, ChatSource } from "@/lib/types/chat"
import { CHAT_SOURCE_DELIMITER } from "@/lib/types/chat"

/**
 * @deprecated Legacy custom delimiter protocol. New UI uses useChat
 * (@ai-sdk/react) against /api/chat/message UIMessage stream.
 * Kept for back-compat until all clients migrate.
 */
export async function streamChatMessage({
  conversationId,
  prompt,
  conversationHistory,
  signal,
  onUpdate,
}: {
  conversationId: string
  prompt: string
  conversationHistory: import("@/lib/types/chat").ChatHistoryEntry[]
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
    } catch {
      // ignore — sources are best-effort
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

  const json = await res.json()
  // New envelope { success, data: { token } } + legacy { token }
  const token = json?.data?.token ?? json?.token;
  if (!token) throw new Error("Share failed: no token");
  return token as string
}

/** Extract plain text from a UIMessage part array (AI SDK v5). */
export function getUIMessageText(message: { parts?: unknown[]; content?: unknown }): string {
  if (Array.isArray(message.parts)) {
    return (message.parts as { type?: string; text?: string }[])
      .filter((p) => p?.type === "text" && typeof p.text === "string")
      .map((p) => p.text as string)
      .join("\n");
  }
  return typeof message.content === "string" ? message.content : "";
}

/** Extract source-url parts from a UIMessage (google grounding + RAG). */
export function getUIMessageSources(message: { parts?: unknown[] }): ChatSource[] {
  if (!Array.isArray(message.parts)) return [];
  const out: ChatSource[] = [];
  for (const p of message.parts as { type?: string; url?: string; title?: string }[]) {
    if (p?.type === "source-url" && p.url) {
      try {
        out.push({ title: p.title || new URL(p.url).hostname, uri: p.url, domain: new URL(p.url).hostname });
      } catch {
        out.push({ title: p.title || p.url, uri: p.url });
      }
    }
  }
  return out;
}
