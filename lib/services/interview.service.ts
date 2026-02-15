import { SupabaseClient } from "@supabase/supabase-js"
import {
  generateInterviewQuestions,
  evaluateInterviewResponses,
} from "@/lib/ai"
import type {
  InterviewQuestion,
  InterviewResponse,
  InterviewFeedback,
} from "@/lib/types/interview"

export async function createInterview(
  supabase: SupabaseClient,
  analysisId: string
): Promise<{ interviewId: string; isCompleted?: string }> {
  const { data: analysisData, error } = await supabase
    .from("analysis_result")
    .select("resume_id, desc_id, user_id")
    .eq("id", analysisId)
    .single()

  if (error || !analysisData) {
    throw new Error(error?.message || "Analysis not found")
  }

  const { data: alreadyExists } = await supabase
    .from("interview")
    .select("id, status")
    .eq("resume_id", analysisData.resume_id)
    .single()

  if (alreadyExists?.id) {
    return {
      interviewId: alreadyExists.id,
      isCompleted: alreadyExists.status,
    }
  }

  const { data: interviewData, error: interviewError } = await supabase
    .from("interview")
    .insert({
      resume_id: analysisData.resume_id,
      job_desc_id: analysisData.desc_id,
      user_id: analysisData.user_id,
    })
    .select("id")
    .single()

  if (interviewError || !interviewData) {
    throw new Error(interviewError?.message || "Failed to create interview")
  }

  await generateQuestionsForInterview(supabase, interviewData.id)

  return { interviewId: interviewData.id }
}

export async function generateQuestionsForInterview(
  supabase: SupabaseClient,
  interviewId: string
): Promise<void> {
  const { data: interviewData, error } = await supabase
    .from("interview")
    .select("resume_id, job_desc_id")
    .eq("id", interviewId)
    .single()

  if (error || !interviewData) {
    throw new Error(error?.message || "Interview not found")
  }

  const { resume_id, job_desc_id } = interviewData

  const [resumeData, jobData] = await Promise.all([
    supabase.from("resume").select("text").eq("id", resume_id).single(),
    supabase
      .from("job_desc")
      .select("description")
      .eq("id", job_desc_id)
      .single(),
  ])

  if (resumeData.error || jobData.error) {
    const errorValue = resumeData.error || jobData.error
    throw new Error(errorValue?.message || "Failed to fetch data")
  }

  const resumeText = resumeData.data.text
  const jdText = jobData.data.description

  const questions = await generateInterviewQuestions(resumeText, jdText)

  const rows = questions.map((question: string, index: number) => ({
    interview_id: interviewId,
    question_text: question,
    order: index + 1,
  }))

  await supabase.from("interview_questions").insert(rows)
}

export async function getInterviewQuestions(
  supabase: SupabaseClient,
  interviewId: string
): Promise<InterviewQuestion[]> {
  const { data: questions, error } = await supabase
    .from("interview_questions")
    .select("question_text, order, id")
    .eq("interview_id", interviewId)
    .limit(10)

  if (error || !questions) {
    throw new Error(error?.message || "Failed to fetch questions")
  }

  return questions
}

export async function evaluateAndSaveResponses(
  supabase: SupabaseClient,
  responses: InterviewResponse[],
  interviewId: string
): Promise<void> {
  const feedbacks = await evaluateInterviewResponses(responses)

  const rows = feedbacks.map((feedback: InterviewFeedback, index: number) => ({
    interview_id: interviewId,
    question_id: responses[index].question_id,
    score: feedback.score,
    feedback_text: feedback.feedback_text,
  }))

  await supabase.from("interview_results").insert(rows)
  await supabase
    .from("interview")
    .update({ status: "completed" })
    .eq("id", interviewId)
}
