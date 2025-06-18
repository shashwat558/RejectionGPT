"use server"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { FeedbackItem } from "@/components/feedbackSidebar";
import { createClientServer } from "../utils/supabase/server"
import { GoogleGenAI } from "@google/genai";

export async function getFeedback({analysisId}: {analysisId: string}){
    const supabase = await createClientServer();
    console.log(analysisId)
    const {data: feedbackData, error: fetchError} = await supabase.from("analysis_result").select("*").eq("id", analysisId).single();

    if(fetchError || !feedbackData) {
        console.log(fetchError?.message)
        throw new Error("Error fetching")
    }
    console.log(feedbackData);
    return feedbackData;
}

export async function getAllFeedbacks() {

    const supabase = await createClientServer();
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    const {data: allFeedbackData, error: fetchError} = await supabase.from("analysis_result").select("id, job_role, company_name, match_score, createdAt, summary").eq("user_id", userId);

    if(fetchError || !allFeedbackData){
        console.log(fetchError.message);
        throw new Error("Error while fetching data")
    }

    const feedbacks: FeedbackItem[] = allFeedbackData.map((item) => ({
    id: item.id,
    jobTitle: item.job_role,
    company: item.company_name,
    date: new Date(item.createdAt).toLocaleDateString(),
    matchScore: item.match_score,
    description: item.summary
  }));

  return feedbacks;


}

export async function initConversation({resumeId, jdId}: {resumeId: string, jdId: string}) {
    const supabase = await createClientServer();
    const user = await supabase.auth.getUser();

    const {data: ChatId, error} = await supabase.from("conversation").insert({
        user_id: user.data.user?.id,
        resume_id: resumeId,
        job_desc_id: jdId,

    }).select('id').single();

    if(error || !ChatId){
        throw new Error("Insertion error");
        
    }
    try {
   embedAndStore({resumeId: resumeId, jdId: jdId})
} catch (e) {
  console.error("Embedding trigger failed", e);
}
    console.log(ChatId)
    return ChatId.id;
}

const textSplitter = async (text:string) => {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
    });


    const chunks = await splitter.createDocuments([text]);
    const chunkTexts = chunks.map(doc => doc.pageContent);
    return chunkTexts; 

}

const genAi = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
console.log(process.env.GEMINI_API_KEY + " This is gemini key")

export async function embedAndStore({resumeId, jdId}: {resumeId: string, jdId: string}) {
    const supabase = await createClientServer();
    
    const [resumeData, jobData] = await Promise.all([
        supabase.from("resume").select('text, id').eq('id', resumeId).single()
    , supabase.from("job_desc").select('title, company_name, description, id').eq('id', jdId).single()]);

    console.log(resumeData.data?.id, jobData.data?.id)

    if(resumeData.error || jobData.error){
        const errorMsg = `Error getting data: ${resumeData.error?.message ?? ''} ${jobData.error?.message ?? ''}`;
        throw new Error(errorMsg.trim());
    }

   const [resumeChunk, jobDescChhunk] = await Promise.all([
    textSplitter(resumeData.data.text),
    textSplitter(jobData.data.description + jobData.data.title + jobData.data.company_name)
   ]);

   console.log("these are lengths", resumeChunk.length, jobDescChhunk.length)

   await Promise.all([
    ...resumeChunk.map(async(chunk, i) => {
        const embeddingResponse = await genAi.models.embedContent({
            model: "text-embedding-004",
            contents: chunk
        });
        const embeddingValue = embeddingResponse?.embeddings && embeddingResponse.embeddings[0]?.values;

        const {error} = await supabase.from("resume_chunks").insert({
            chunk_index: i,
            content: chunk,
            embedding: embeddingValue,
            resume_id: resumeData.data.id
        });
        if(error){
            console.log(error.details + "This is resue error")
        }
    }), 
    ...jobDescChhunk.map(async(chunk, i) => {
        
        const embeddingResponse = await genAi.models.embedContent({
            model: "text-embedding-004",
            contents: chunk
        });
        const embeddingValue = embeddingResponse.embeddings && embeddingResponse.embeddings[0].values;
        console.log(embeddingValue)

        const {data, error} = await supabase.from("job_desc_chunks").insert({
            content: chunk,
            chunk_index: i,
            embedding: embeddingValue,
            job_desc_id: jobData.data.id
        }).select('id');

        if(error){
            console.log(error.message + "This is jd error")
        }
        
    })
   ])





    
}