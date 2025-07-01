import { evaluateResponsesAndSave } from "@/lib/actions/actions";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest){
    const {responses, interviewId} = await req.json();

    console.log(responses, interviewId);

    if(responses.length > 0) {
        try {
            await evaluateResponsesAndSave(responses, interviewId);
            

            return NextResponse.json({success: true})
        } catch (error) {

            console.log(error)
            return NextResponse.json({success: false})
            
        }
    }
}