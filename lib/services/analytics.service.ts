import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { createClientServer } from "@/lib/utils/supabase/server"
import type { AnalysisDetail, AnalysisSummary } from "@/lib/types/analytics"
import { extractJobInfo, generateResumeAnalysis } from "@/lib/ai"

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

export async function createAnalysisFromUpload({
  file,
  jobDesc,
  userId,
}: {
  file: File
  jobDesc: string
  userId: string
}): Promise<{ analysisId: string }> {
  if (!file) {
    throw new Error("Missing resume file")
  }

  const supabase = await createClientServer()
  const loader = new PDFLoader(file)
  const docs = await loader.load()
  const resumeText = docs[0]?.pageContent || ""

  if (!resumeText) {
    throw new Error("Failed to read resume content")
  }

  const [jobInfo, feedback] = await Promise.all([
    extractJobInfo(jobDesc),
    generateResumeAnalysis({ resumeText, jobDescription: jobDesc }),
  ])

  const [resumeRes, jdRes] = await Promise.all([
    supabase
      .from("resume")
      .insert({ filename: file.name, text: resumeText, user_id: userId })
      .select("id")
      .single(),
    supabase
      .from("job_desc")
      .insert({
        title: jobInfo.title,
        company_name: jobInfo.company || "N/A",
        description: jobInfo.description,
        user_id: userId,
      })
      .select("id")
      .single(),
  ])

  if (resumeRes.error || jdRes.error || !resumeRes.data || !jdRes.data) {
    throw new Error("Failed to store resume or job description")
  }

  const { data: analysisData, error } = await supabase
    .from("analysis_result")
    .insert({
      match_score: feedback.match_score,
      summary: feedback.summary,
      strengths: feedback.strengths,
      missing_skills: feedback.missing_skills,
      weak_points: feedback.weak_points,
      resume_id: resumeRes.data.id,
      desc_id: jdRes.data.id,
      company_name: jobInfo.company,
      job_role: jobInfo.title,
      user_id: userId,
    })
    .select("id")
    .single()

  if (error || !analysisData) {
    throw new Error("Failed to store analysis")
  }

  return { analysisId: analysisData.id }
}
