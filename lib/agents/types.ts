import { z } from "zod";

/** Shared agent types — model-agnostic, works with Vercel AI SDK. */

export const agentRoleSchema = z.enum(["analyzer", "interviewer", "dsa", "roadmap", "chat", "practice"]);
export type AgentRole = z.infer<typeof agentRoleSchema>;

export interface AgentContext {
  userId: string;
  role?: AgentRole;
  analysisId?: string;
  conversationId?: string;
  interviewId?: string;
  requestId: string;
}

export interface AgentResult<T = unknown> {
  role: AgentRole;
  data: T;
  usage?: { inputTokens?: number; outputTokens?: number; model: string };
}

export interface ToolDef<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: z.ZodType<TInput, z.ZodTypeDef, unknown>;
  execute: (input: TInput, ctx: AgentContext) => Promise<TOutput>;
}
