import { aiAnswer } from "@/lib/actions/actions";
import { createClientServer } from "@/lib/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt, conversationId } = await req.json();
  console.log("Received:", { prompt, conversationId });

  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const genAi = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const supabase = await createClientServer();

  const {data: FetchData, error} = await supabase.from("conversation").select("resume_id, job_desc_id").eq("id", conversationId);
  
  if (error || !FetchData || FetchData.length === 0) {
  throw new Error(`Error getting data: ${error?.message || "No conversation found"}`);
}

const { resume_id, job_desc_id } = FetchData[0];
console.log(resume_id, job_desc_id);

  try {
    const embeddingResponse = await genAi.models.embedContent({
      model: "text-embedding-004",
      contents: prompt,
    });

    const embedding =
      embeddingResponse.embeddings && embeddingResponse.embeddings[0].values;
   

    const [resume_chunks, job_chunks] = await Promise.all([
      supabase.rpc("match_resume_chunk", {
        query_embedding: embedding,
        match_threshold: 0.6,
        match_count: 2,
        targeted_resume_id: resume_id
      }),
      supabase.rpc("match_job_chunks", {
        query_embedding: embedding,
        match_threshold: 0.6,
        match_count: 2,
        targeted_job_desc_id: job_desc_id
      }),
    ]);

    

    if (!resume_chunks || !job_chunks) {
      const errorMsg =
        resume_chunks?.error?.message ||
        job_chunks?.error?.message ||
        "Unknown error";
      throw new Error(`Got an error: ${errorMsg}`);
    }

    let finalResumeChunks = resume_chunks.data.length > 0 && resume_chunks.data[0].content || [];
    let finalJobDescChunks = job_chunks.data[0].content || [];

    if(finalResumeChunks.length === 0){
      const fallbackResume = await supabase.from('resume_chunks').select('content').eq('resume_id', resume_id).order("chunk_index", {ascending: true}).limit(5);

      finalResumeChunks = fallbackResume.data && fallbackResume.data[0].content  || [];
    }

    if(finalJobDescChunks.length === 0){
      const fallbackJobChunks = await supabase.from("job_desc_chunks").select("content").eq("job_desc_id", job_desc_id).order("chunk_index", {ascending: true}).limit(5);

      finalJobDescChunks = (fallbackJobChunks.data && fallbackJobChunks.data[0]?.content + fallbackJobChunks.data[1].content) || [];
    }

    const answer = await aiAnswer({jobDescText: finalJobDescChunks, resumeText: finalResumeChunks, userPrompt: prompt });
    console.log(answer)

    console.log(finalJobDescChunks)
    
    return NextResponse.json({answer})



   

    

    
  } catch (error) {
    console.error("Error in /api/chat/message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
