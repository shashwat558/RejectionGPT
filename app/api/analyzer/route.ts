import { NextRequest } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";



export async function POST(req: NextRequest) {
    const {resume, jobDesc}: {resume: File, jobDesc: string} = await req.json();

    if(resume){
        try {
            const loader = new PDFLoader(resume);

            const docs = await loader.load()
            console.log(docs[0])
        } catch (error) {
            
            console.error(error)
        }
    }

    
}