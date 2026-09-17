import { z } from "zod";
import type { AgentContext, ToolDef } from "@/lib/agents/types";
import { extractJobInfo, generateResumeAnalysis } from "@/lib/ai";
import { createClientServer } from "@/lib/utils/supabase/server";
import { logger } from "@/lib/logger";

export const analyzeResumeInput = z.object({
  resumeText: z.string().min(1).max(100000),
  jobDescription: z.string().min(10).max(20000),
  filename: z.string().max(255).optional().default("resume.pdf"),
});

export type AnalyzeResumeInput = z.output<typeof analyzeResumeInput>;

export interface AnalyzeResumeOutput {
  analysisId: string;
  resumeId: string;
  jdId: string;
}

/**
 * Analyzer tool — single owner of resume-vs-JD analysis persistence.
 * Extract JD → score → persist resume/jd/analysis.
 * Embeddings + conversation are owned by the caller (analytics.service),
 * so this tool has no fire-and-forget side effects.
 */
export const analyzeResumeTool: ToolDef<AnalyzeResumeInput, AnalyzeResumeOutput> = {
  name: "analyzeResume",
  description: "Analyze resume vs JD and persist analysis",
  inputSchema: analyzeResumeInput,
  async execute(input, ctx: AgentContext) {
    const resumeText = input.resumeText.slice(0, 100000);
    const jobDescription = input.jobDescription.slice(0, 20000);
    const filename = (input.filename || "resume.pdf").slice(0, 255);

    const supabase = await createClientServer();
    const [jobInfo, feedback] = await Promise.all([
      extractJobInfo(jobDescription),
      generateResumeAnalysis({ resumeText, jobDescription }),
    ]);

    const [resumeRes, jdRes] = await Promise.all([
      supabase.from("resume").insert({ filename, text: resumeText, user_id: ctx.userId }).select("id").single(),
      supabase.from("job_desc").insert({ title: jobInfo.title, company_name: jobInfo.company || "N/A", description: jobInfo.description, user_id: ctx.userId }).select("id").single(),
    ]);
    if (resumeRes.error || jdRes.error || !resumeRes.data || !jdRes.data) {
      logger.error("[analyzeResume] store failed", {
        requestId: ctx.requestId,
        resumeError: resumeRes.error?.message,
        jdError: jdRes.error?.message,
      });
      throw new Error("analyzeResume: failed to store resume/JD");
    }
    const { data, error } = await supabase.from("analysis_result").insert({
      match_score: feedback.match_score,
      summary: feedback.summary,
      strengths: feedback.strengths,
      missing_skills: feedback.missing_skills,
      weak_points: feedback.weak_points,
      resume_id: resumeRes.data.id,
      desc_id: jdRes.data.id,
      company_name: jobInfo.company,
      job_role: jobInfo.title,
      user_id: ctx.userId,
    }).select("id").single();
    if (error || !data) {
      logger.error("[analyzeResume] analysis insert failed", { requestId: ctx.requestId, error: error?.message });
      throw new Error("analyzeResume: failed to store analysis");
    }

    logger.info("[analyzeResume] done", { requestId: ctx.requestId, analysisId: data.id });
    return { analysisId: data.id, resumeId: resumeRes.data.id, jdId: jdRes.data.id };
  },
};
