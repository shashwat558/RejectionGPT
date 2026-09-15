import { NextRequest } from "next/server"
import { z } from "zod"
import type { ChatShareMessage } from "@/lib/types/chat"
import { createChatShareToken } from "@/lib/services/chat.service"
import { requireConversationOwner } from "@/lib/api/auth"
import { fail, handleApiError, ok, requestId } from "@/lib/api/response"

const messageSchema = z.object({
  id: z.string().max(100),
  content: z.string().max(20000),
  role: z.enum(["user", "assistant"]),
  timestamp: z.union([z.string(), z.number(), z.date()]),
  sources: z.array(z.object({ title: z.string().optional(), uri: z.string().optional(), domain: z.string().optional() }).passthrough()).optional().default([]),
});

const bodySchema = z.object({
  conversationId: z.string().uuid(),
  title: z.string().max(200).optional().default("Untitled chat"),
  messages: z.array(messageSchema).max(200),
});

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return fail("Invalid payload", { status: 400, requestId: rid })
    }
    const { conversationId, title, messages } = parsed.data;

    // Must own the conversation to share it
    const { userId } = await requireConversationOwner(conversationId);

    const normalizedMessages: ChatShareMessage[] = messages.map((m) => ({
      id: String(m.id),
      content: String(m.content ?? ""),
      role: m.role,
      timestamp: new Date(m.timestamp).toISOString(),
      sources: m.sources || [],
    }))

    const token = await createChatShareToken({
      conversationId,
      title: title || "Untitled chat",
      messages: normalizedMessages,
      userId,
    })

    return ok({ token }, { requestId: rid });
  } catch (error) {
    return handleApiError(error, rid);
  }
}
