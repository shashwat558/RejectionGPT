import type { AnalysisDetail, AnalysisSummary } from "@/lib/types/analytics"
import { analyzeResumeTool } from "@/lib/agents/tools/analyzer"
import { extractPdfText } from "@/lib/services/pdf"
import { embedAndStore } from "@/lib/services/embedding.service"
import { initConversation } from "@/lib/services/chat.service"
import { createClientServer } from "@/lib/utils/supabase/server"
import { logger } from "@/lib/logger"

export async function getAnalysisById(analysisId: string): Promise<AnalysisDetail> {
  const supabase = await createClientServer()
  const { data, error } = await supabase
    .from("analysis_result")
    .select("*")
    .eq("id", analysisId)
    .single()

  if (error || !data) {
    throw new Error(error?.message || "Failed to load analysis")
  }

  const rawScore = data.match_score
  const normalizedScore =
    typeof rawScore === "string" ? parseInt(rawScore.replace("%", "")) : rawScore

  return {
    ...(data as AnalysisDetail),
    match_score: Number.isNaN(normalizedScore) ? 0 : normalizedScore,
  }
}

export async function listAnalysesForUser(userId: string): Promise<AnalysisSummary[]> {
  const supabase = await createClientServer()
  const { data, error } = await supabase
    .from("analysis_result")
    .select("id, job_role, company_name, match_score, createdAt, summary, dsa_question_created")
    .eq("user_id", userId)

  if (error || !data) {
    throw new Error(error?.message || "Failed to load analyses")
  }

  return data.map((item) => ({
    id: item.id,
    jobTitle: item.job_role,
    company: item.company_name,
    date: new Date(item.createdAt).toLocaleDateString(),
    matchScore: item.match_score,
    description: item.summary,
    dsaQuestionCreated: item.dsa_question_created,
  }))
}

/**
 * Full upload pipeline, orchestrated through the Analyzer agent tool:
 * PDF extract → analyzeResumeTool (LLM + persist) → initConversation →
 * embedAndStore (best-effort RAG indexing).
 */
export async function createAnalysisFromUpload({
  file,
  jobDesc,
  userId,
  requestId = "unknown",
}: {
  file: File
  jobDesc: string
  userId: string
  requestId?: string
}): Promise<{ analysisId: string; conversationId: string; resumeId: string; jdId: string }> {
  if (!file) {
    throw new Error("Missing resume file")
  }

  const { text: resumeText } = await extractPdfText(file);

  const { analysisId, resumeId, jdId } = await analyzeResumeTool.execute(
    { resumeText, jobDescription: jobDesc, filename: file.name },
    { userId, requestId, role: "analyzer" }
  );

  const conversationId = await initConversation({ resumeId, jdId, userId });

  // RAG indexing is best-effort: chat falls back to raw chunks if missing,
  // so a failed embed must not fail the whole upload.
  try {
    await embedAndStore({ resumeId, jdId })
  } catch (error) {
    logger.warn("[analyzer] embedding failed (non-fatal)", { requestId, error: String(error) })
  }

  logger.info("[analyzer] upload complete", { requestId, analysisId, conversationId });
  return { analysisId, conversationId, resumeId, jdId }
}
