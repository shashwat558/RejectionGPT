import { NextRequest, NextResponse } from "next/server";
import { startDiagnostic } from "@/lib/services/diagnostic.service";
import { requireUser } from "@/lib/api/auth";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/api/rate-limit";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";
import { startDiagnosticBodySchema } from "@/lib/services/diagnostic.schema";

// 3 LLM generations per diagnostic — tight limit.
const LIMIT = 3;
const DURATION = 300;

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const ip = getClientIp(req);
    const { allowed, remaining } = await checkRateLimit(
      `rate-limit:diagnostic-start:${ip || "unknown"}`,
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
    const parsed = startDiagnosticBodySchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation error: tier + monthsLeft (1-24) required", { status: 400, requestId: rid });
    }
    const result = await startDiagnostic({
      userId,
      tier: parsed.data.tier,
      monthsLeft: parsed.data.monthsLeft,
      requestId: rid,
    });
    return ok(result, { requestId: rid, headers: rateLimitHeaders(remaining, LIMIT) });
  } catch (error) {
    return handleApiError(error, rid);
  }
}
