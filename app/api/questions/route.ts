import { NextRequest } from "next/server"
import { z } from "zod"
import { createInterview } from "@/lib/services/interview.service"
import { requireAnalysisOwner } from "@/lib/api/auth"
import { fail, handleApiError, ok, requestId } from "@/lib/api/response"

const bodySchema = z.object({ analysisId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return fail("Missing or invalid analysisId", { status: 400, requestId: rid })
    }
    const { analysisId } = parsed.data;

    // Ownership check: createInterview also scoped, but verify up-front for 403
    const { supabase } = await requireAnalysisOwner(analysisId);
    const result = await createInterview(supabase, analysisId)

    return ok(
      { interviewId: result.interviewId, isCompleted: result.isCompleted },
      { requestId: rid }
    );
  } catch (error) {
    return handleApiError(error, rid);
  }
}
