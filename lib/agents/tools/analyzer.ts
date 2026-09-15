import { z } from "zod";
import type { AgentContext, ToolDef } from "@/lib/agents/types";
import { extractJobInfo, generateResumeAnalysis } from "@/lib/ai";
import { createClientServer } from "@/lib/utils/supabase/server";
import { embedAndStore } from "@/lib/services/embedding.service";

export const analyzeResumeInput = z.object({
  resumeText: z.string().min(1).max(100000),
  jobDescription: z.string().min(10).max(20000),
  filename: z.string().max(255).optional().default("resume.pdf"),
});

export type AnalyzeResumeInput = z.output<typeof analyzeResumeInput>;

/** Analyzer tool: extract JD → score → persist resume/jd/analysis → queue embeddings. */
export const analyzeResumeTool: ToolDef<AnalyzeResumeInput, { analysisId: string }> = {
  name: "analyzeResume",
  description: "Analyze resume vs JD and persist analysis",
  inputSchema: analyzeResumeInput as unknown as z.ZodSchema<AnalyzeResumeInput>,
  async execute(input, ctx: AgentContext) {
    const supabase = await createClientServer();
    const [jobInfo, feedback] = await Promise.all([
      extractJobInfo(input.jobDescription),
      generateResumeAnalysis({ resumeText: input.resumeText, jobDescription: input.jobDescription }),
    ]);

    const [resumeRes, jdRes] = await Promise.all([
      supabase.from("resume").insert({ filename: input.filename, text: input.resumeText, user_id: ctx.userId }).select("id").single(),
      supabase.from("job_desc").insert({ title: jobInfo.title, company_name: jobInfo.company || "N/A", description: jobInfo.description, user_id: ctx.userId }).select("id").single(),
    ]);
    if (resumeRes.error || jdRes.error || !resumeRes.data || !jdRes.data) {
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
    if (error || !data) throw new Error("analyzeResume: failed to store analysis");

    // Fire-and-forget embeddings (awaited with catch so failures surface in logs)
    embedAndStore({ resumeId: resumeRes.data.id, jdId: jdRes.data.id }).catch((e) =>
      console.error("[analyzeResume] embed failed", e)
    );
    return { analysisId: data.id };
  },
};
