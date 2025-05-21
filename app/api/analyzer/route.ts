import { NextRequest, NextResponse } from "next/server";

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

import { createClientServer } from "@/lib/utils/supabase/server";
import {GoogleGenAI} from '@google/genai';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

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
    const match = result?.match(/```json\s*([\s\S]*?)```/);
    const jsonString = match ? match[1].trim() : result?.trim();
    const sanitizedJsonString = jsonString?.replace(/[\x00-\x1F\x7F]/g, ''); // 
    const mainString = JSON.parse(sanitizedJsonString ?? "");
    console.log(mainString)
    

    
    return mainString;


    
}



export async function POST(req: NextRequest) {

    const supabase = await createClientServer();
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    const data = await req.formData();
    const file: File| null = data.get("resume") as unknown as File;
    const filename = file.size;
    const jobDesc: string = data.get("jobDesc") as unknown as string;
    

    const tailoredJobDescription = await descTailor({jobDesc: jobDesc});
     
    console.log(tailoredJobDescription.title, tailoredJobDescription.company, tailoredJobDescription.description);

    // await supabase.from("job_desc").insert({
    //     title: tailoredJobDescription.title,
    //     company_name: (tailoredJobDescription.company ===null ? "N/A": tailoredJobDescription.company),
    //     description: tailoredJobDescription.description,
    //     user_id: userId
    // })

    
    const loader = new PDFLoader(file);
    const docs = await loader.load();
    const resumeText = docs[0].pageContent;

    // await supabase.from("resume").insert({
    //     filename: filename,
    //     text: resumeText,
    //     createdAt: ((new Date()).toISOString()).toLocaleString()
    // })




    
    
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 20
    })
    const chunks = await textSplitter.createDocuments([resumeText]);
    console.log(chunks.length);


    

    if(!file){
        return NextResponse.json({success: false})
    }

    return NextResponse.json({success: true, filename})

    
  }