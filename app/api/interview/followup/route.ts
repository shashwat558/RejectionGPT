import { NextRequest, NextResponse } from "next/server";
import { generateInterviewFollowup } from "@/lib/ai";
import { requireInterviewOwner } from "@/lib/api/auth";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/api/rate-limit";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";
import { followupBodySchema } from "@/lib/services/followup.schema";
import { logger } from "@/lib/logger";

const LIMIT = 15;
const DURATION = 60;

/**
 * Adaptive follow-up decision for a live interview turn.
 * Never blocks the interview: empty answers skip the LLM call and any
 * LLM failure degrades to { type: "next" }.
 */
export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const ip = getClientIp(req);
    const { allowed, remaining } = await checkRateLimit(
      `rate-limit:followup:${ip || "unknown"}`,
      LIMIT,
      DURATION
    );
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded", requestId: rid },
        { status: 429, headers: { ...rateLimitHeaders(remaining, LIMIT), "Retry-After": String(DURATION) } }
      );
    }

    const json = await req.json().catch(() => null);
    const parsed = followupBodySchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation error: interviewId + questionId + questionText required", { status: 400, requestId: rid });
    }
    const { interviewId, questionText, answer, followupNumber, history, role, company } = parsed.data;

    await requireInterviewOwner(interviewId);

    // Skips/empties never spend an LLM call.
    if (!answer.trim()) {
      return ok({ type: "next" as const }, { requestId: rid, headers: rateLimitHeaders(remaining, LIMIT) });
    }

    const result = await generateInterviewFollowup({
      question: questionText,
      answer,
      history,
      role,
      company,
    });

    logger.info("[followup] decided", { requestId: rid, interviewId, followupNumber, type: result.type });
    return ok(result, { requestId: rid, headers: rateLimitHeaders(remaining, LIMIT) });
  } catch (error) {
    return handleApiError(error, rid);
  }
}
