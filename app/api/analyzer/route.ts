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
    const {resumeBase64, jobDesc, userId} = await req.json();
    console.log(resumeBase64, jobDesc, userId + "this is what you need");
    console.log("resume type", typeof resumeBase64)


    

    

    const supabase = await createClientServer();

    if(resumeBase64){
      try{
          const buffer = Buffer.from(String(resumeBase64), "base64");
          const loader = new PDFLoader(new Blob([buffer]));
          const docs = await loader.load();
          const resumeText = docs[0].pageContent;
          console.log(resumeText);
          return NextResponse.json({resumeText})
        


           
            


            
        } catch (error) {
            console.log(error)
            return NextResponse.json({message: "I fucked up"})
            
        }
    }

    
  }