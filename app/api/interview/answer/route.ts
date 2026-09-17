import { NextRequest } from "next/server";
import { z } from "zod";
import { requireInterviewOwner } from "@/lib/api/auth";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";
import { logger } from "@/lib/logger";

const answerSchema = z.object({
  questionId: z.string().uuid(),
  answerText: z.string().max(10000),
  timeSpent: z.number().min(0).max(3600),
  clientId: z.string().uuid().optional(),
  followupOf: z.string().uuid().nullable().optional(),
  promptText: z.string().max(2000).nullable().optional(),
});

const bodySchema = z.object({
  interviewId: z.string().uuid(),
  answers: z.array(answerSchema).min(1).max(40),
});

function isMissingColumnError(message: string) {
  return /could not find the '(followup_of|prompt_text)' column|column .* does not exist|PGRST204/i.test(message);
}

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return fail("Validation error: interviewId + answers required", { status: 400, requestId: rid });
    const { interviewId, answers } = parsed.data;
    const { supabase } = await requireInterviewOwner(interviewId);

    // Parents first so followup_of linkage is valid within the batch.
    const ordered = [...answers].sort((a, b) => Number(Boolean(a.followupOf)) - Number(Boolean(b.followupOf)));

    const fullRows = ordered.map((a) => ({
      ...(a.clientId ? { id: a.clientId } : {}),
      interview_id: interviewId,
      question_id: a.questionId,
      answer_text: a.answerText,
      time_spent: a.timeSpent,
      followup_of: a.followupOf ?? null,
      prompt_text: a.promptText ?? null,
    }));

    let { error: ansError } = await supabase.from("interview_answers").insert(fullRows);
    if (ansError && isMissingColumnError(ansError.message)) {
      // Migration supabase/interview_followups.sql not applied yet — save base columns.
      logger.warn("[answer] follow-up columns missing, saving base", { requestId: rid });
      const baseRows = ordered.map((a) => ({
        ...(a.clientId ? { id: a.clientId } : {}),
        interview_id: interviewId,
        question_id: a.questionId,
        answer_text: a.answerText,
        time_spent: a.timeSpent,
      }));
      ({ error: ansError } = await supabase.from("interview_answers").insert(baseRows));
    }
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
