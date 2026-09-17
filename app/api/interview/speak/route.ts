import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { requireInterviewOwner } from "@/lib/api/auth";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/api/rate-limit";
import { fail, handleApiError, requestId } from "@/lib/api/response";
import { speakBodySchema as bodySchema } from "@/lib/services/speak.schema";
import { logger } from "@/lib/logger";

const LIMIT = 10;
const DURATION = 60;
const DEEPGRAM_TIMEOUT_MS = 15000;
const MAX_CACHE = 200;

const DEFAULT_VOICE = process.env.DEEPGRAM_VOICE || "aura-2-andromeda-en";

// In-memory LRU keyed by sha256(voice + text). Revisits/replays cost zero.
const cache = new Map<string, Buffer>();
function cacheKey(voice: string, text: string) {
  return createHash("sha256").update(`${voice}\n${text}`).digest("hex");
}
function cacheSet(key: string, buf: Buffer) {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, buf);
  while (cache.size > MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (!oldest) break;
    cache.delete(oldest);
  }
}

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const ip = getClientIp(req);
    const { allowed, remaining } = await checkRateLimit(
      `rate-limit:speak:${ip || "unknown"}`,
      LIMIT,
      DURATION
    );
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded", requestId: rid },
        { status: 429, headers: { ...rateLimitHeaders(remaining, LIMIT), "Retry-After": String(DURATION) } }
      );
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return fail("Voice is not configured on the server", { status: 503, requestId: rid, code: "TTS_UNCONFIGURED" });
    }

    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation error: interviewId + text (1-2000 chars) required", { status: 400, requestId: rid });
    }
    const { interviewId, text, voice } = parsed.data;
    const resolvedVoice = (voice || DEFAULT_VOICE).slice(0, 80);

    await requireInterviewOwner(interviewId);

    const key = cacheKey(resolvedVoice, text);
    const hit = cache.get(key);
    if (hit) {
      logger.info("[speak] cache hit", { requestId: rid });
      return new NextResponse(new Uint8Array(hit), {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "private, max-age=86400",
          "x-request-id": rid,
          "x-cache": "HIT",
          ...rateLimitHeaders(remaining, LIMIT),
        },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEEPGRAM_TIMEOUT_MS);
    let dgRes: Response;
    try {
      dgRes = await fetch(
        // Aura-2: the `model` param IS the voice (e.g. aura-2-andromeda-en)
        `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(resolvedVoice)}&encoding=mp3`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!dgRes.ok) {
      const errText = await dgRes.text().catch(() => "").then((t) => t.slice(0, 300));
      logger.error("[speak] deepgram failed", { requestId: rid, status: dgRes.status, error: errText });
      return fail("Voice synthesis failed", { status: 502, requestId: rid });
    }

    const buf = Buffer.from(await dgRes.arrayBuffer());
    if (!buf.length || buf.length > 5 * 1024 * 1024) {
      return fail("Voice synthesis returned invalid audio", { status: 502, requestId: rid });
    }
    cacheSet(key, buf);
    logger.info("[speak] synthesized", { requestId: rid, bytes: buf.length });

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
        "x-request-id": rid,
        "x-cache": "MISS",
        ...rateLimitHeaders(remaining, LIMIT),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return fail("Voice synthesis timed out", { status: 504, requestId: rid });
    }
    return handleApiError(error, rid);
  }
}
