"use server"

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
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/embed/init`, {
        method: "POST",
        body: JSON.stringify({
            userId: user.data.user?.id,
            resumeId: resumeId,
            jdId: jdId
        })
    })
    console.log(ChatId)
    return ChatId.id;
}

export async function embeddStore({resumeId, jdId}: {resumeId: string, jdId: string}) {
    const supabase = await createClientServer();
    const genAi = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    const [resumeData, jobData] = await Promise.all([
        supabase.from("resume").select('text').eq('id', resumeId).single()
    , supabase.from("job_desc").select('title, company_name, description').eq('id', jdId).single()]);

    if(resumeData.error || jobData.error){
        const errorMsg = `Error getting data: ${resumeData.error?.message ?? ''} ${jobData.error?.message ?? ''}`;
        throw new Error(errorMsg.trim());
    }

    
}