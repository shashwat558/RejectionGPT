import { NextRequest } from "next/server"
import { z } from "zod"
import { evaluateAndSaveResponses } from "@/lib/services/interview.service"
import { requireInterviewOwner } from "@/lib/api/auth"
import { fail, handleApiError, ok, requestId } from "@/lib/api/response"

const responseSchema = z.object({
  question_id: z.string().uuid().optional(),
  question_text: z.string().max(2000).optional(),
  answer: z.string().max(10000),
});

const bodySchema = z.object({
  interviewId: z.string().uuid(),
  responses: z.array(responseSchema).min(1).max(20),
});

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation error: interviewId + responses[1..20] required", { status: 400, requestId: rid })
    }
    const { responses, interviewId } = parsed.data;

    const { supabase } = await requireInterviewOwner(interviewId);
    await evaluateAndSaveResponses(
      supabase,
      responses as Parameters<typeof evaluateAndSaveResponses>[1],
      interviewId
    )

    return ok({ evaluated: true }, { requestId: rid });
  } catch (error) {
    return handleApiError(error, rid);
  }
}
