/**
 * Model router — server-side multi-model.
 * Default: Gemini 2.5-flash via @ai-sdk/google. Fallback: OpenAI gpt-4o-mini.
 * No BYOK: keys from server env only.
 */
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

export const MODELS = {
  fast: "gemini-2.5-flash",
  analysis: "gemini-2.0-flash",
  embedding: "gemini-embedding-001",
} as const;

export type ModelTier = "fast" | "analysis" | "reasoning";

export function getChatModel(tier: ModelTier = "fast") {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY || process.env.OPENAI_API);
  if (tier === "reasoning" && hasOpenAI) return openai("gpt-4o-mini");
  if (hasGemini) {
    return tier === "analysis" ? google("gemini-2.0-flash") : google("gemini-2.5-flash");
  }
  if (hasOpenAI) return openai("gpt-4o-mini");
  throw new Error("No LLM configured: set GEMINI_API_KEY or OPENAI_API_KEY");
}

export function getEmbeddingModelName(): string {
  return MODELS.embedding;
}
