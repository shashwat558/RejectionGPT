import { createClientServer } from "@/lib/utils/supabase/server"
import type { ChatHistoryEntry, ChatShareMessage } from "@/lib/types/chat"
import { embedText, streamChatAnswer } from "@/lib/ai"
import { embedAndStore } from "@/lib/services/embedding.service"

export async function createChatStream({
  conversationId,
  prompt,
  conversationHistory,
}: {
  conversationId: string
  prompt: string
  conversationHistory: ChatHistoryEntry[]
}) {
  const supabase = await createClientServer()

  const { data: conversation, error } = await supabase
    .from("conversation")
    .select("resume_id, job_desc_id")
    .eq("id", conversationId)

  if (error || !conversation || conversation.length === 0) {
    throw new Error("Conversation not found")
  }

  const { resume_id, job_desc_id } = conversation[0]

  const embedding = await embedText(prompt)
  if (!embedding || embedding.length === 0) {
    throw new Error("Failed to generate embedding")
  }

  const [resumeChunks, jobChunks] = await Promise.all([
    supabase.rpc("match_resume_chunk", {
      query_embedding: embedding,
      match_threshold: 0.6,
      match_count: 2,
      targeted_resume_id: resume_id,
    }),
    supabase.rpc("match_job_chunks", {
      query_embedding: embedding,
      match_threshold: 0.6,
      match_count: 2,
      targeted_job_desc_id: job_desc_id,
    }),
  ])

  const resumeChunkData = Array.isArray(resumeChunks?.data) ? resumeChunks.data : []
  const jobChunkData = Array.isArray(jobChunks?.data) ? jobChunks.data : []

  let finalResumeChunks = resumeChunkData.map((c: { content: string }) => c.content)
  let finalJobDescChunks = jobChunkData.map((c: { content: string }) => c.content)

  if (finalResumeChunks.length === 0) {
    const fallbackResume = await supabase
      .from("resume_chunks")
      .select("content")
      .eq("resume_id", resume_id)
      .order("chunk_index", { ascending: true })
      .limit(5)

    finalResumeChunks = fallbackResume.data?.map((c) => c.content) || []
  }

  if (finalJobDescChunks.length === 0) {
    const fallbackJobChunks = await supabase
      .from("job_desc_chunks")
      .select("content")
      .eq("job_desc_id", job_desc_id)
      .order("chunk_index", { ascending: true })
      .limit(5)

    finalJobDescChunks = fallbackJobChunks.data?.map((c) => c.content) || []
  }

  return streamChatAnswer({
    resumeText: finalResumeChunks,
    jobDescText: finalJobDescChunks,
    userPrompt: prompt,
    conversationHistory,
  })
}

export async function initConversation({
  resumeId,
  jdId,
}: {
  resumeId: string
  jdId: string
}) {
  const supabase = await createClientServer()
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id

  if (!userId) {
    throw new Error("User not authenticated")
  }

  const { data: existingData, error: fetchError } = await supabase
    .from("conversation")
    .select("id")
    .eq("job_desc_id", jdId)
    .eq("resume_id", resumeId)
    .eq("user_id", userId)

  if (fetchError) {
    throw new Error("Failed to fetch existing conversation")
  }

  if (existingData && existingData.length > 0) {
    return existingData[0].id
  }

  const { data: chatData, error: insertError } = await supabase
    .from("conversation")
    .insert({
      user_id: userId,
      resume_id: resumeId,
      job_desc_id: jdId,
    })
    .select("id")
    .single()

  if (insertError || !chatData) {
    throw new Error("Insertion error")
  }

  try {
    embedAndStore({ resumeId, jdId })
  } catch (error) {
    console.error("Embedding trigger failed", error)
  }

  return chatData.id
}

export async function createChatShareToken({
  conversationId,
  title,
  messages,
  userId,
}: {
  conversationId: string
  title: string
  messages: ChatShareMessage[]
  userId: string
}) {
  const supabase = await createClientServer()
  const token = crypto.randomUUID().replace(/-/g, "")

  const { error } = await supabase.from("shared_chat").insert({
    token,
    conversation_id: conversationId,
    title,
    messages,
    created_by: userId,
  })

  if (error) {
    throw new Error(error.message)
  }

  return token
}
