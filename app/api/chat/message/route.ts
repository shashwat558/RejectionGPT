import { aiAnswer } from "@/lib/actions/actions";
import { createClientServer } from "@/lib/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);
const LIMIT = 5;
const DURATION = 60;
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
  const key = `rate-limit:${ip}`;
  const current = await redis.incr(key);
  if(current === 1){
    await redis.expire(key, DURATION);
  }
  if(current > LIMIT){
    return NextResponse.json({error:"Rate limit exceeded"}, {status: 429}); 
  }
  const { prompt, conversationId, conversationHistory } = await req.json();
  console.log("Received:", { prompt, conversationId, conversationHistory });

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

    console.log(resume_chunks, job_chunks)

    

    if (!resume_chunks || !job_chunks) {
      const errorMsg =
        resume_chunks?.error?.message ||
        job_chunks?.error?.message ||
        "Unknown error";
      throw new Error(`Got an error: ${errorMsg}`);
    }

    let finalResumeChunks = resume_chunks.data.map((c: {content: string}) => c.content) || [];
    let finalJobDescChunks = job_chunks.data.map((c: {content: string}) => c.content) || [];


    if(finalResumeChunks.length === 0){
      const fallbackResume = 
      (await supabase
      .from('resume_chunks')
      .select('content')
      .eq('resume_id', resume_id)
      .order("chunk_index", {ascending: true})
      .limit(5)).data?.map((c) => c.content)

      finalResumeChunks = fallbackResume
    }

    if(finalJobDescChunks.length === 0){
      const fallbackJobChunks = (await supabase.from("job_desc_chunks").select("content").eq("job_desc_id", job_desc_id).order("chunk_index", {ascending: true}).limit(5)).data?.map((c) => c.content);


      finalJobDescChunks = fallbackJobChunks
    }

    const answer = await aiAnswer({jobDescText: finalJobDescChunks, resumeText: finalResumeChunks, userPrompt: prompt, conversationHistory: conversationHistory });
    


    
    return new NextResponse(answer, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked"

      }
    })



   

    

    
  } catch (error) {
    console.error("Error in /api/chat/message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
