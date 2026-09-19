import { NextRequest, NextResponse } from "next/server";
import { createPracticeSet, getPracticeStats } from "@/lib/services/practice.service";
import { requireUser } from "@/lib/api/auth";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/api/rate-limit";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";
import { generatePracticeBodySchema } from "@/lib/services/practice.schema";
import { topicsForTrack } from "@/lib/types/practice";
import { logger } from "@/lib/logger";

const LIMIT = 5;
const DURATION = 60;

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const ip = getClientIp(req);
    const { allowed, remaining } = await checkRateLimit(
      `rate-limit:practice-gen:${ip || "unknown"}`,
      LIMIT,
      DURATION
    );
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded", requestId: rid },
        { status: 429, headers: { ...rateLimitHeaders(remaining, LIMIT), "Retry-After": String(DURATION) } }
      );
    }

    const { userId } = await requireUser();
    const json = await req.json().catch(() => null);
    const parsed = generatePracticeBodySchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation error: track + topic required", { status: 400, requestId: rid });
    }
    const { track, topic, difficulty, count, analysisId } = parsed.data;

    if (!topicsForTrack(track).includes(topic)) {
      return fail(`Unknown topic for ${track}`, { status: 400, requestId: rid });
    }

    const result = await createPracticeSet({
      userId,
      track,
      topic,
      difficulty,
      count,
      analysisId,
      requestId: rid,
    });
    const stats = await getPracticeStats(userId).catch((e) => {
      logger.warn("[practice] stats failed (non-fatal)", { requestId: rid, error: String(e) });
      return [];
    });
    return ok({ ...result, stats }, { requestId: rid, headers: rateLimitHeaders(remaining, LIMIT) });
  } catch (error) {
    return handleApiError(error, rid);
  }
}
