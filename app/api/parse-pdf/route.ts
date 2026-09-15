import { NextRequest, NextResponse } from "next/server"
import { parseResumePDF } from "@/lib/services/resume.service"
import { requireUser } from "@/lib/api/auth"
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/api/rate-limit"
import { fail, handleApiError, ok, requestId } from "@/lib/api/response"

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    await requireUser();
    const ip = getClientIp(req);
    const { allowed, remaining } = await checkRateLimit(`rate-limit:parse-pdf:${ip || "unknown"}`, 10, 60);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded", requestId: rid },
        { status: 429, headers: { ...rateLimitHeaders(remaining, 10), "Retry-After": "60" } }
      );
    }

    const data = await req.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return fail("No file provided", { status: 400, requestId: rid })
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return fail("File must be a PDF", { status: 400, requestId: rid })
    }
    if (file.size > MAX_PDF_BYTES) {
      return fail("File too large (max 10MB)", { status: 400, requestId: rid })
    }

    const parsedData = await parseResumePDF(file)
    return ok({ json: parsedData }, { requestId: rid })
  } catch (error) {
    return handleApiError(error, rid);
  }
}
