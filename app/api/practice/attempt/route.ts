import { NextRequest, NextResponse } from "next/server";
import { submitPracticeAttempt } from "@/lib/services/practice.service";
import { requireUser } from "@/lib/api/auth";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/api/rate-limit";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";
import { attemptPracticeBodySchema } from "@/lib/services/practice.schema";

const LIMIT = 30;
const DURATION = 60;

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const ip = getClientIp(req);
    const { allowed, remaining } = await checkRateLimit(
      `rate-limit:practice-attempt:${ip || "unknown"}`,
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
    const parsed = attemptPracticeBodySchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation error: questionId required", { status: 400, requestId: rid });
    }
    const feedback = await submitPracticeAttempt({
      userId,
      questionId: parsed.data.questionId,
      selectedIndex: parsed.data.selectedIndex ?? null,
      answerText: parsed.data.answerText,
      timeSpent: parsed.data.timeSpent,
      requestId: rid,
    });
    return ok(feedback, { requestId: rid, headers: rateLimitHeaders(remaining, LIMIT) });
  } catch (error) {
    return handleApiError(error, rid);
  }
}
