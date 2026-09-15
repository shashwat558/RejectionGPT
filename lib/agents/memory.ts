/**
 * Agent memory — conversation history (capped) + per-user profile.
 * Client zustand stores remain as UI cache only; source of truth is Supabase.
 */
import { createClientServer } from "@/lib/utils/supabase/server";

export async function getConversationHistory(conversationId: string, limit = 20) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("messages")
    .select("role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) {
    // Table may not exist yet (migration not applied) — fail soft
    return [];
  }
  return (data ?? []).map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: String(m.content).slice(0, 4000),
  }));
}

export async function appendMessage(opts: {
  conversationId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
}) {
  const supabase = await createClientServer();
  const { error } = await supabase.from("messages").insert({
    conversation_id: opts.conversationId,
    user_id: opts.userId,
    role: opts.role,
    content: opts.content.slice(0, 20000),
  });
  if (error) {
    // Fail soft — chat still streams even if persistence fails
    const { logger } = await import("@/lib/logger");
    logger.warn("[memory] append failed", { error: error.message });
  }
}
