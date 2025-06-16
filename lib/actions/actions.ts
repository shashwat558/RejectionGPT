"use server"

import { FeedbackItem } from "@/components/feedbackSidebar";
import { createClientServer } from "../utils/supabase/server"

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
    console.log(ChatId)
    return ChatId;
}