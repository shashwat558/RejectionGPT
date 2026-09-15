import { NextRequest } from "next/server";
import { z } from "zod";
import { requireInterviewOwner } from "@/lib/api/auth";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";

const answerSchema = z.object({
  questionId: z.string().uuid(),
  answerText: z.string().max(10000),
  timeSpent: z.number().min(0).max(3600),
});

const bodySchema = z.object({
  interviewId: z.string().uuid(),
  answers: z.array(answerSchema).min(1).max(20),
});

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return fail("Validation error: interviewId + answers required", { status: 400, requestId: rid });
    const { interviewId, answers } = parsed.data;
    const { supabase } = await requireInterviewOwner(interviewId);

    const rows = answers.map((a) => ({
      interview_id: interviewId,
      question_id: a.questionId,
      answer_text: a.answerText,
      time_spent: a.timeSpent,
    }));
    const { error: ansError } = await supabase.from("interview_answers").insert(rows);
    if (ansError) return fail(ansError.message, { status: 500, requestId: rid });

    const { error: updError } = await supabase
      .from("interview")
      .update({ ended_at: new Date().toISOString(), status: "completed" })
      .eq("id", interviewId);
    if (updError) return fail(updError.message, { status: 500, requestId: rid });

    return ok({ saved: answers.length }, { requestId: rid });
  } catch (e) {
    return handleApiError(e, rid);
  }
}
