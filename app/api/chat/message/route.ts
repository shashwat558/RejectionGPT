import { NextRequest, NextResponse } from "next/server"
import Redis from "ioredis"
import { createChatStream } from "@/lib/services/chat.service"
import type { ChatHistoryEntry } from "@/lib/types/chat"

const redis = new Redis(process.env.REDIS_URL!);
const LIMIT = 5;
const DURATION = 60;
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const key = `rate-limit:${ip}`;
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, DURATION);
    }
    if (current > LIMIT) {
      console.warn("[chat/message] rate limit", { requestId, ip });
      return NextResponse.json({ error: "Rate limit exceeded", requestId }, { status: 429 });
    }

    const { prompt, conversationId, conversationHistory } = await req.json();
    console.log("[chat/message] received", {
      requestId,
      hasPrompt: Boolean(prompt),
      conversationId,
      historyCount: Array.isArray(conversationHistory) ? conversationHistory.length : "invalid",
    });

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt", requestId }, { status: 400 });
    }

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId", requestId }, { status: 400 });
    }

    const stream = await createChatStream({
      conversationId,
      prompt,
      conversationHistory: (conversationHistory || []) as ChatHistoryEntry[],
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked"

      }
    })



   

    

    
  } catch (error) {
    console.error("[chat/message] unhandled error", { requestId, error });
    return NextResponse.json(
      { error: "Internal Server Error", requestId },
      { status: 500 }
    );
  }
}
