import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { streamText, convertToModelMessages, stepCountIs } from "ai"
import { google } from "@ai-sdk/google"
import { getChatModel } from "@/lib/agents/models"
import { CHAT_SYSTEM, PROMPT_VERSION } from "@/lib/agents/prompts"
import { vectorSearch } from "@/lib/agents/tools/vector-search"
import { appendMessage } from "@/lib/agents/memory"
import { createChatStream } from "@/lib/services/chat.service"
import type { ChatHistoryEntry } from "@/lib/types/chat"
import { requireConversationOwner } from "@/lib/api/auth"
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/api/rate-limit"
import { fail, handleApiError, requestId } from "@/lib/api/response"
import { logger } from "@/lib/logger"

// AI SDK v5 UIMessage (lenient — forward-compatible)
const uiMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]).or(z.string()),
  parts: z.array(z.any()).optional(),
  content: z.any().optional(),
}).passthrough();

const newBodySchema = z.object({
  messages: z.array(uiMessageSchema).min(1).max(50),
  id: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  memory: z.string().max(2000).optional().default(""),
});

// Legacy custom-protocol body (deprecated, kept for back-compat)
const legacyBodySchema = z.object({
  prompt: z.string().trim().min(1).max(8000),
  conversationId: z.string().uuid(),
  conversationHistory: z.array(z.any()).max(40).optional().default([]),
});

const LIMIT = 10;
const DURATION = 60;

function getTextFromUIMessage(msg: z.infer<typeof uiMessageSchema>): string {
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p) => p && (p.type === "text" || typeof p.text === "string"))
      .map((p) => String(p.text ?? ""))
      .join("\n")
      .slice(0, 8000);
  }
  if (typeof msg.content === "string") return msg.content.slice(0, 8000);
  return "";
}

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const ip = getClientIp(req);
    const { allowed, remaining } = await checkRateLimit(
      `rate-limit:chat:${ip || "unknown"}`,
      LIMIT,
      DURATION
    );
    if (!allowed) {
      logger.warn("[chat/message] rate limit", { requestId: rid, ip });
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded", requestId: rid },
        { status: 429, headers: { ...rateLimitHeaders(remaining, LIMIT), "Retry-After": String(DURATION) } }
      );
    }

    const json = await req.json().catch(() => null);
    if (!json) return fail("Invalid JSON", { status: 400, requestId: rid });

    // --- New AI SDK path ---
    const parsedNew = newBodySchema.safeParse(json);
    if (parsedNew.success) {
      const { messages, memory } = parsedNew.data;
      const conversationId = parsedNew.data.conversationId ?? parsedNew.data.id;
      if (!conversationId) return fail("conversationId (or id) required", { status: 400, requestId: rid });

      const { userId, conversation } = await requireConversationOwner(conversationId);
      const resumeId = (conversation as { resume_id: string }).resume_id;
      const jobDescId = (conversation as { job_desc_id: string }).job_desc_id;

      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      const lastUserText = lastUser ? getTextFromUIMessage(lastUser) : "";
      if (!lastUserText.trim()) return fail("Empty message", { status: 400, requestId: rid });

      // RAG pre-retrieval (single entrypoint, capped)
      let resumeCtx = "";
      let jdCtx = "";
      try {
        const chunks = await vectorSearch({ prompt: lastUserText, resumeId, jobDescId });
        resumeCtx = chunks.resume.join("\n\n").slice(0, 12000);
        jdCtx = chunks.jd.join("\n\n").slice(0, 12000);
      } catch (e) {
        logger.warn("[chat/message] RAG failed, continuing without context", { requestId: rid, error: String(e) });
      }

      const mem = (memory || "").trim().slice(0, 2000);
      const system =
        CHAT_SYSTEM(resumeCtx, jdCtx) + (mem ? `\n\nConversation memory (user-provided):\n${mem}` : "");

      const modelMessages = await convertToModelMessages(messages.slice(-20) as Parameters<typeof convertToModelMessages>[0]);

      logger.info("[chat/message] stream", { requestId: rid, conversationId, version: PROMPT_VERSION, msgCount: messages.length });

      const result = streamText({
        model: getChatModel("fast"),
        system,
        messages: modelMessages,
        stopWhen: stepCountIs(3),
        tools: { google_search: google.tools.googleSearch({}) },
        onFinish: async ({ text }) => {
          // Best-effort persistence — never fail the stream
          try {
            await appendMessage({ conversationId, userId, role: "user", content: lastUserText });
            if (text?.trim()) await appendMessage({ conversationId, userId, role: "assistant", content: text });
          } catch (e) {
            logger.warn("[chat/message] persist failed", { requestId: rid, error: String(e) });
          }
        },
      });

      return result.toUIMessageStreamResponse({
        headers: { "x-request-id": rid, ...rateLimitHeaders(remaining, LIMIT) },
      });
    }

    // --- Legacy fallback (deprecated custom delimiter protocol) ---
    const parsedLegacy = legacyBodySchema.safeParse(json);
    if (!parsedLegacy.success) {
      return fail("Validation error: provide {messages[], conversationId} or legacy {prompt, conversationId}", {
        status: 400,
        requestId: rid,
      });
    }
    const { prompt, conversationId, conversationHistory } = parsedLegacy.data;
    await requireConversationOwner(conversationId);
    logger.warn("[chat/message] legacy protocol used", { requestId: rid, conversationId });

    const stream = await createChatStream({
      conversationId,
      prompt,
      conversationHistory: (conversationHistory || []) as unknown as ChatHistoryEntry[],
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "x-request-id": rid,
        ...rateLimitHeaders(remaining, LIMIT),
      }
    })
  } catch (error) {
    return handleApiError(error, rid);
  }
}
