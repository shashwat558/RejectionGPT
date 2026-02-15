"use server"

import { createClientServer } from "../utils/supabase/server"
import type { AnalysisSummary } from "@/lib/types/analytics"
import type { InterviewQuestion } from "@/lib/types/interview"
import { getAnalysisById, listAnalysesForUser } from "@/lib/services/analytics.service"
import { initConversation as initConversationService } from "@/lib/services/chat.service"
import { getInterviewQuestions as getInterviewQuestionsService } from "@/lib/services/interview.service"

export async function getFeedback({ analysisId }: { analysisId: string }) {
  return await getAnalysisById(analysisId)
}

export async function getAllFeedbacks(): Promise<AnalysisSummary[]> {
  const supabase = await createClientServer()
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id

  if (!userId) {
    throw new Error("User not authenticated")
  }

  return await listAnalysesForUser(userId)
}

export async function initConversation({
  resumeId,
  jdId,
}: {
  resumeId: string
  jdId: string
}) {
  return await initConversationService({ resumeId, jdId })
}

export async function getInterviewQuestions(
  interviewId: string
): Promise<InterviewQuestion[]> {
  const supabase = await createClientServer()
  return await getInterviewQuestionsService(supabase, interviewId)
}

