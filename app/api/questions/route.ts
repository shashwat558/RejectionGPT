import { generateInterviewQuestionsAndSaveToDb } from "@/lib/actions/actions";
import { createClientServer } from "@/lib/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const {analysisId} = await req.json();
    console.log("--------------------------------------------------------------------------------------------", analysisId)
    const supabase = await createClientServer();

    try{


        const {data: analysisData, error} = await supabase.from("analysis_result").select("resume_id, desc_id ,user_id").eq('id', analysisId).single();

    if(error || !analysisData){
        throw new Error(error?.message);
    }

    const {data: alreadyExists} = await supabase.from("interview").select("id, status").eq('resume_id',analysisData.resume_id ).single();
    if(alreadyExists?.id){
        return NextResponse.json({interviewId: alreadyExists.id, isCompleted: alreadyExists.status})
    }


    const {data:interviewId, error: InterviewIdError} = await supabase.from("interview").insert({
        resume_id: analysisData.resume_id,
        job_desc_id: analysisData.desc_id,
        user_id: analysisData.user_id,
         
    }).select('id').single();

    if(InterviewIdError){
        console.log(InterviewIdError.message)
    }

    await generateInterviewQuestionsAndSaveToDb({interviewId: interviewId?.id})

    return NextResponse.json({success: true, interviewId: interviewId?.id})
} catch(error){
    console.log(error);
    return NextResponse.json({success: false})
}
    


}