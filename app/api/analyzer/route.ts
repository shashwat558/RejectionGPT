import { NextRequest, NextResponse } from "next/server"
import { createAnalysisFromUpload } from "@/lib/services/analytics.service"
import { requireUser } from "@/lib/api/auth"
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/api/rate-limit"
import { fail, handleApiError, ok, requestId } from "@/lib/api/response"
import { logger } from "@/lib/logger"

const LIMIT = 10
const DURATION = 60
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_JD_CHARS = 20000;

export async function POST(req: NextRequest) {
    const rid = requestId();
    const ip = getClientIp(req);
    const { allowed, remaining } = await checkRateLimit(`rate-limit:analyzer:${ip || "unknown"}`, LIMIT, DURATION);
    if (!allowed) {
        return NextResponse.json(
            { success: false, error: "Rate limit exceeded", requestId: rid },
            { status: 429, headers: { ...rateLimitHeaders(remaining, LIMIT), "Retry-After": String(DURATION) } }
        );
    }

    try {
        const { userId } = await requireUser();

        const data = await req.formData()
        const file = data.get("resume") as File | null
        const jobDesc = ((data.get("jobDesc") as string) || "").slice(0, MAX_JD_CHARS)

        if (!file) {
            return fail("Missing resume", { status: 400, requestId: rid })
        }
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            return fail("Resume must be a PDF", { status: 400, requestId: rid })
        }
        if (file.size > MAX_PDF_BYTES) {
            return fail("Resume too large (max 10MB)", { status: 400, requestId: rid })
        }
        if (!jobDesc.trim() || jobDesc.trim().length < 10) {
            return fail("Job description too short", { status: 400, requestId: rid })
        }

        const result = await createAnalysisFromUpload({ file, jobDesc, userId, requestId: rid })
        return ok(result, { requestId: rid, headers: rateLimitHeaders(remaining, LIMIT) })
    } catch (error) {
        logger.error("[analyzer] error", { requestId: rid, error: String(error) })
        return handleApiError(error, rid)
    }
}
