
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    
    const {resumeId, jdId, userId} = await req.json();
    console.log(resumeId, jdId, userId);

    try {
        await embeddStore({resumeId, jdId, userId});
        return NextResponse.json({success: true});
    } catch (error) {
        console.log(error);
        return NextResponse.json({success: false})
        
    }

}