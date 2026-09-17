import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { getGenAI, EMBEDDING_MODEL } from "@/lib/ai"
import { createClientServer } from "@/lib/utils/supabase/server"
import { logger } from "@/lib/logger"

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const EMBED_CONCURRENCY = 4;

const textSplitter = async (text: string) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  })

  const chunks = await splitter.createDocuments([text])
  return chunks.map((doc) => doc.pageContent)
}

async function embedOne(genAi: ReturnType<typeof getGenAI>, chunk: string): Promise<number[] | null> {
  try {
    const res = await genAi.models.embedContent({ model: EMBEDDING_MODEL, contents: chunk });
    return res.embeddings?.[0]?.values ?? null;
  } catch (e) {
    logger.warn("[embed] chunk failed", { error: String(e) });
    return null;
  }
}

/** Run tasks with bounded concurrency (avoids hammering the embedding API). */
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

/**
 * Chunk + embed + store. Idempotent: clears existing chunks for the
 * resume/JD first so retries don't duplicate. Best-effort per chunk —
 * throws only if nothing was stored.
 */
export async function embedAndStore({
  resumeId,
  jdId,
}: {
  resumeId: string
  jdId: string
}) {
  const supabase = await createClientServer()

  const [resumeData, jobData] = await Promise.all([
    supabase.from("resume").select("text, id").eq("id", resumeId).single(),
    supabase
      .from("job_desc")
      .select("title, company_name, description, id")
      .eq("id", jdId)
      .single(),
  ])

  if (resumeData.error || jobData.error) {
    const errorMsg = `Error getting data: ${resumeData.error?.message ?? ""} ${jobData.error?.message ?? ""}`
    throw new Error(errorMsg.trim())
  }

  const [resumeChunks, jobDescChunks] = await Promise.all([
    textSplitter(resumeData.data.text),
    textSplitter(`${jobData.data.description ?? ""}\n${jobData.data.title ?? ""}\n${jobData.data.company_name ?? ""}`),
  ])

  // Idempotency: clear stale chunks before re-insert
  await Promise.all([
    supabase.from("resume_chunks").delete().eq("resume_id", resumeData.data.id),
    supabase.from("job_desc_chunks").delete().eq("job_desc_id", jobData.data.id),
  ])

  const genAi = getGenAI();
  const resumeEmbeds = await mapWithConcurrency(resumeChunks, EMBED_CONCURRENCY, (c) => embedOne(genAi, c));
  const jdEmbeds = await mapWithConcurrency(jobDescChunks, EMBED_CONCURRENCY, (c) => embedOne(genAi, c));

  const resumeRows = resumeChunks
    .map((chunk, i) => ({ chunk_index: i, content: chunk, embedding: resumeEmbeds[i], resume_id: resumeData.data.id }))
    .filter((r) => r.embedding?.length);
  const jdRows = jobDescChunks
    .map((chunk, i) => ({ content: chunk, chunk_index: i, embedding: jdEmbeds[i], job_desc_id: jobData.data.id }))
    .filter((r) => r.embedding?.length);

  if (!resumeRows.length && !jdRows.length) {
    throw new Error("embedAndStore: all embeddings failed");
  }

  const [rIns, jIns] = await Promise.all([
    resumeRows.length ? supabase.from("resume_chunks").insert(resumeRows) : Promise.resolve({ error: null }),
    jdRows.length ? supabase.from("job_desc_chunks").insert(jdRows) : Promise.resolve({ error: null }),
  ]);
  if (rIns.error || jIns.error) {
    logger.error("[embed] insert failed", { resumeError: rIns.error?.message, jdError: jIns.error?.message });
    throw new Error("embedAndStore: failed to store chunks");
  }
  logger.info("[embed] stored", { resumeChunks: resumeRows.length, jdChunks: jdRows.length });
}
