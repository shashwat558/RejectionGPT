
import { embedAndStore } from "@/lib/actions/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    
    const {resumeId, jdId, userId} = await req.json();
    console.log(resumeId, jdId, userId);

    try {
        await embedAndStore({resumeId, jdId});
        return NextResponse.json({success: true});
    } catch (error) {
        console.log(error);
        return NextResponse.json({success: false})
        
    }

}