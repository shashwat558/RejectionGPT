import { NextRequest, NextResponse } from "next/server";

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

import { createClientServer } from "@/lib/utils/supabase/server";
import {GoogleGenAI} from '@google/genai';

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});



async function descTailor({jobDesc}: {jobDesc: string}) {
    const Prompt = `
    Extract the job title ,company name and description from the following job description. 

    Respond in the following JSON format:
    {
    "title": "",
    "company": "",
    "description: "",
    }

    Job Description:
    ${jobDesc}
    `;

    const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: Prompt
    })
    const result = response.text;
    console.log(result);
    return result


    
}



export async function POST(req: NextRequest) {

    const supabase = await createClientServer();
    const user = await supabase.auth.getUser();
    console.log(user.data.user?.id);
    const data = await req.formData();
    const file: File| null = data.get("resume") as unknown as File;
    const filename = file.size;
    const jobDesc: string = data.get("jobDesc") as unknown as string;
    console.log(jobDesc);

    const tailoredJobDescription = await descTailor({jobDesc: jobDesc});
    console.log(tailoredJobDescription);


    const loader = new PDFLoader(file);
    const docs = await loader.load();
    const resumeText = docs[0].pageContent;
    console.log(resumeText);
    

    if(!file){
        return NextResponse.json({success: false})
    }

    return NextResponse.json({success: true, filename})

    
  }