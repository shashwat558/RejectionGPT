import { createClientServer } from "@/lib/utils/supabase/server";

/** Require an authenticated user; throws 401 error otherwise. */
export async function requireUser() {
  const supabase = await createClientServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return { supabase, user: data.user, userId: data.user.id };
}

/** Verify the current user owns the analysis row. Returns the row. */
export async function requireAnalysisOwner(analysisId: string) {
  const { supabase, userId } = await requireUser();
  const { data, error } = await supabase
    .from("analysis_result")
    .select("id, user_id, resume_id, desc_id")
    .eq("id", analysisId)
    .single();
  if (error || !data) throw new Error("Analysis not found");
  if (data.user_id !== userId) throw new Error("Forbidden: not your analysis");
  return { supabase, userId, analysis: data };
}

/** Verify the current user owns the conversation row. */
export async function requireConversationOwner(conversationId: string) {
  const { supabase, userId } = await requireUser();
  const { data, error } = await supabase
    .from("conversation")
    .select("id, user_id, resume_id, job_desc_id")
    .eq("id", conversationId)
    .single();
  if (error || !data) throw new Error("Conversation not found");
  if (data.user_id !== userId) throw new Error("Forbidden: not your conversation");
  return { supabase, userId, conversation: data };
}

/** Verify the current user owns the interview row. */
export async function requireInterviewOwner(interviewId: string) {
  const { supabase, userId } = await requireUser();
  const { data, error } = await supabase
    .from("interview")
    .select("id, user_id, resume_id, job_desc_id, status")
    .eq("id", interviewId)
    .single();
  if (error || !data) throw new Error("Interview not found");
  if (data.user_id !== userId) throw new Error("Forbidden: not your interview");
  return { supabase, userId, interview: data };
}
