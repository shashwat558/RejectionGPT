import { createClientServer } from "@/lib/utils/supabase/server";
import { embedText } from "@/lib/ai";

export interface RetrievedChunks {
  resume: string[];
  jd: string[];
}

/**
 * Vector search tool — single RAG entrypoint for all agents.
 * Uses unified gemini-embedding-001 + match RPCs with fallback.
 */
export async function vectorSearch(opts: {
  prompt: string;
  resumeId: string;
  jobDescId: string;
  matchCount?: number;
  threshold?: number;
}): Promise<RetrievedChunks> {
  const { prompt, resumeId, jobDescId, matchCount = 4, threshold = 0.5 } = opts;
  const supabase = await createClientServer();
  const embedding = await embedText(prompt);
  if (!embedding?.length) throw new Error("vectorSearch: embedding failed");

  const [r, j] = await Promise.all([
    supabase.rpc("match_resume_chunk", {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: matchCount,
      targeted_resume_id: resumeId,
    }),
    supabase.rpc("match_job_chunks", {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: matchCount,
      targeted_job_desc_id: jobDescId,
    }),
  ]);

  let resume = (Array.isArray(r.data) ? r.data : []).map((c: { content: string }) => c.content);
  let jd = (Array.isArray(j.data) ? j.data : []).map((c: { content: string }) => c.content);

  if (!resume.length) {
    const f = await supabase.from("resume_chunks").select("content").eq("resume_id", resumeId).order("chunk_index").limit(5);
    resume = (f.data ?? []).map((c) => c.content);
  }
  if (!jd.length) {
    const f = await supabase.from("job_desc_chunks").select("content").eq("job_desc_id", jobDescId).order("chunk_index").limit(5);
    jd = (f.data ?? []).map((c) => c.content);
  }
  return { resume: resume.slice(0, 5), jd: jd.slice(0, 5) };
}
