import { generateText, stepCountIs } from "ai";
import { getChatModel } from "@/lib/agents/models";
import { CHAT_SYSTEM, DSA_SYSTEM, ROADMAP_SYSTEM, PROMPT_VERSION } from "@/lib/agents/prompts";
import { vectorSearch } from "@/lib/agents/tools/vector-search";
import { analyzeResumeTool, type AnalyzeResumeInput } from "@/lib/agents/tools/analyzer";
import type { AgentContext } from "@/lib/agents/types";
import { logger } from "@/lib/logger";

/**
 * Orchestrator — routes a user request to the right job-prep capability
 * using tool-calling (max 3 steps), with RAG + token caps.
 */

export async function runAnalyzerAgent(opts: {
  input: AnalyzeResumeInput;
  ctx: AgentContext;
}) {
  const parsed = analyzeResumeTool.inputSchema.parse(opts.input);
  const result = await analyzeResumeTool.execute(parsed, opts.ctx);
  logger.info("[agent/analyzer]", { requestId: opts.ctx.requestId, version: PROMPT_VERSION, analysisId: result.analysisId });
  return result;
}

export async function runChatAgent(opts: {
  prompt: string;
  resumeId: string;
  jobDescId: string;
  history: { role: "user" | "assistant"; content: string }[];
  ctx: AgentContext;
}): Promise<string> {
  const { prompt, resumeId, jobDescId, history, ctx } = opts;
  const chunks = await vectorSearch({ prompt, resumeId, jobDescId });
  const system = CHAT_SYSTEM(chunks.resume.join("\n\n").slice(0, 12000), chunks.jd.join("\n\n").slice(0, 12000));

  const { text, usage } = await generateText({
    model: getChatModel("fast"),
    system,
    messages: [...history.slice(-20), { role: "user" as const, content: prompt.slice(0, 8000) }],
    stopWhen: stepCountIs(3),
  });
  logger.info("[agent/chat]", { requestId: ctx.requestId, version: PROMPT_VERSION, usage });
  return text;
}

export async function runDsaAgent(opts: { feedback: unknown; ctx: AgentContext }): Promise<string> {
  const { text } = await generateText({
    model: getChatModel("analysis"),
    system: DSA_SYSTEM,
    prompt: `Feedback:\n${JSON.stringify(opts.feedback).slice(0, 8000)}`,
  });
  return text;
}

export async function runRoadmapAgent(opts: {
  analysis: Record<string, unknown>;
  experienceLevel: string;
}): Promise<string> {
  const { text } = await generateText({
    model: getChatModel("analysis"),
    system: ROADMAP_SYSTEM,
    prompt: `Analysis:\n${JSON.stringify(opts.analysis).slice(0, 10000)}\nExperience: ${opts.experienceLevel}`,
  });
  return text;
}
