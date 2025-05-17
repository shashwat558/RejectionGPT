import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { createClientServer } from "@/lib/utils/supabase/server";
import {GoogleGenAI} from '@google/genai';
import formidable from 'formidable';
import { IncomingMessage } from "http";

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export const config = {
    api: {
        bodyParser: false
    }
}

function parseForm(req: IncomingMessage): Promise<{ fields: any; files: any }> {
  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
}

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
    const {fields, files} = await parseForm(req);

    const jobDesc = fields.jobDesc?.[0] || '';
  const userId = fields.userId?.[0];
  const resumeFile = files.resume?.[0];

    

    const supabase = await createClientServer();

    if(resumeFile){
        try {
            const buffer = Buffer.from(await resumeFile.arrayBuffer());
            const blob = new Blob([buffer]);
            const loader = new PDFLoader(blob);
            const docs = await loader.load();

            const text = docs[0].pageContent
            const filename = resumeFile.name;
            const desc = await descTailor({jobDesc});
            console.log(text, filename, desc)

            return NextResponse.json({text, filename, desc, userId})



           
            


            
        } catch (error) {
            
            console.error(error)
        }
    }

    
}