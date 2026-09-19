import { NextRequest, NextResponse } from "next/server";
import { completeDiagnostic } from "@/lib/services/diagnostic.service";
import { requireUser } from "@/lib/api/auth";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/api/rate-limit";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";
import { completeDiagnosticBodySchema } from "@/lib/services/diagnostic.schema";

const LIMIT = 5;
const DURATION = 300;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rid = requestId();
  try {
    const ip = getClientIp(req);
    const { allowed, remaining } = await checkRateLimit(
      `rate-limit:diagnostic-complete:${ip || "unknown"}`,
      LIMIT,
      DURATION
    );
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded", requestId: rid },
        { status: 429, headers: { ...rateLimitHeaders(remaining, LIMIT), "Retry-After": String(DURATION) } }
      );
    }
    const { id } = await params;
    if (!id) return fail("Diagnostic id required", { status: 400, requestId: rid });
    const { userId } = await requireUser();
    const json = await req.json().catch(() => ({}));
    const parsed = completeDiagnosticBodySchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation error", { status: 400, requestId: rid });
    }
    const diagnostic = await completeDiagnostic({
      userId,
      id,
      targetRole: parsed.data.targetRole,
      requestId: rid,
    });
    return ok({ diagnostic }, { requestId: rid, headers: rateLimitHeaders(remaining, LIMIT) });
  } catch (error) {
    return handleApiError(error, rid);
  }
}
