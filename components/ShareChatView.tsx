"use client"

import MessageBubble from "@/components/MEssageBubble"

interface SharedMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
  sources?: { title: string; uri: string }[]
}

export default function ShareChatView({
  title,
  createdAt,
  messages,
}: {
  title: string
  createdAt: string
  messages: SharedMessage[]
}) {
  const parsedMessages = messages.map((message) => ({
    ...message,
    timestamp: new Date(message.timestamp),
  }))

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col px-6 py-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Shared chat snapshot</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-100">{title}</h1>
        <p className="mt-1 text-xs text-gray-500">
          {new Date(createdAt).toLocaleString([], {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-2">
        {parsedMessages.map((message) => (
          <MessageBubble key={message.id} message={message} actionsEnabled={false} />
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-gray-400">
        This is a read-only snapshot. Sign in to continue the conversation.
      </div>
    </div>
  )
}
