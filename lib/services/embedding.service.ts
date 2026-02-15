import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { GoogleGenAI } from "@google/genai"
import { createClientServer } from "@/lib/utils/supabase/server"

const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const textSplitter = async (text: string) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })

  const chunks = await splitter.createDocuments([text])
  return chunks.map((doc) => doc.pageContent)
}

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
    textSplitter(jobData.data.description + jobData.data.title + jobData.data.company_name),
  ])

  await Promise.all([
    ...resumeChunks.map(async (chunk, i) => {
      const embeddingResponse = await genAi.models.embedContent({
        model: "text-embedding-004",
        contents: chunk,
      })
      const embeddingValue = embeddingResponse.embeddings?.[0]?.values

      await supabase.from("resume_chunks").insert({
        chunk_index: i,
        content: chunk,
        embedding: embeddingValue,
        resume_id: resumeData.data.id,
      })
    }),
    ...jobDescChunks.map(async (chunk, i) => {
      const embeddingResponse = await genAi.models.embedContent({
        model: "text-embedding-004",
        contents: chunk,
      })
      const embeddingValue = embeddingResponse.embeddings?.[0]?.values

      await supabase.from("job_desc_chunks").insert({
        content: chunk,
        chunk_index: i,
        embedding: embeddingValue,
        job_desc_id: jobData.data.id,
      })
    }),
  ])
}
