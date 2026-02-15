import { createClientServer } from "@/lib/utils/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import type { ChatShareMessage } from "@/lib/types/chat"
import { createChatShareToken } from "@/lib/services/chat.service"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClientServer()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId, title, messages } = await req.json()

    if (!conversationId || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const normalizedMessages: ChatShareMessage[] = messages.map((message: ChatShareMessage) => ({
      id: String(message.id),
      content: String(message.content ?? ""),
      role: message.role === "assistant" ? "assistant" : "user",
      timestamp: new Date(message.timestamp).toISOString(),
      sources: message.sources || [],
    }))

    const token = await createChatShareToken({
      conversationId,
      title: title || "Untitled chat",
      messages: normalizedMessages,
      userId: user.id,
    })

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Share chat error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
