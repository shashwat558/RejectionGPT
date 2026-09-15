import { generateText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { getChatModel } from "@/lib/agents/models";
import { CHAT_SYSTEM, DSA_SYSTEM, ROADMAP_SYSTEM, PROMPT_VERSION } from "@/lib/agents/prompts";
import { vectorSearch } from "@/lib/agents/tools/vector-search";
import type { AgentContext } from "@/lib/agents/types";
import { logger } from "@/lib/logger";

/**
 * Orchestrator — routes a user request to the right job-prep capability
 * using tool-calling (max 5 steps), with RAG + token caps.
 */

const searchTool = (ctx: AgentContext) =>
  tool({
    description: "Retrieve resume/JD chunks relevant to the prompt",
    inputSchema: z.object({ query: z.string().min(1).max(2000) }),
    execute: async ({ query }: { query: string }) => {
      // Caller must supply ids via context extension; resolved by route handler
      return { query, note: "resolved by handler", ctx: ctx.requestId };
    },
  });

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
    tools: { retrieve: searchTool(ctx) },
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
