import { NextRequest, NextResponse } from "next/server";

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClientServer } from "@/lib/utils/supabase/server";
import {GoogleGenAI} from '@google/genai';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { VertexAIEmbeddings } from "@langchain/google-vertexai";
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

const embeddings = new VertexAIEmbeddings({
    model: "text-embedding-005",
    location: "us-central1"
})




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

     const id = await supabase.from("resume").insert({
         filename: filename,
         text: resumeText,
         createdAt: ((new Date()).toISOString()).toLocaleString()
     }).select()




    
    
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 200,
        chunkOverlap: 20
    })
    const chunks = await textSplitter.splitText(resumeText);
    console.log(chunks.length);
    console.log(chunks);

    for(let i=0; i<chunks.length; i++){
        const chunk = chunks[i];
        const embedding = await embeddings.embedQuery(chunk);
        await supabase.from("resume_chunks").insert({
            chunk_id: i,
            
        })
    }

    


    

    if(!file){
        return NextResponse.json({success: false})
    }

    return NextResponse.json({success: true, filename})

    
  }