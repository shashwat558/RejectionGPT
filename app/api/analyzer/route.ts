import { NextRequest, NextResponse } from "next/server";

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

import { createClientServer } from "@/lib/utils/supabase/server";
import {GoogleGenAI, Type} from '@google/genai';

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
        model: "gemini-2.0-flash",
        contents: [
            {role: "user", parts: [{text: Prompt}]}
        ],
        
        
    })
    const result = response.text;
    const match = result?.match(/```json\s*([\s\S]*?)```/);
    const jsonString = match ? match[1].trim() : result?.trim();
    const sanitizedJsonString = jsonString?.replace(/[\x00-\x1F\x7F]/g, ''); // 
    const mainString = JSON.parse(sanitizedJsonString ?? "");
    console.log(mainString)
    

    
    return mainString;


    
}

async function aifeedback({resumeText, jobDescription}: {resumeText: string, jobDescription: string}){
    const Prompt = `
            You are a smart, supportive, and slightly sarcastic career coach. You’ve reviewed thousands of resumes and job descriptions. Now, you're helping a real person figure out how their resume fits the job they want.

            Your job is to give helpful, real feedback. Be clear, specific, and honest — even if it stings a little. Add a *touch of sarcasm* here and there to keep it real and fun, but never be rude or mean. Think of yourself as a friendly mentor with a dry sense of humor.

            Return the feedback in a structured JSON format.

            - "match_score" should be a percentage string (e.g., "78%").
            - "strengths" should be concise, one-liner points.
            - Keep feedback actionable and realistic.

            You are given two things:

            1. The user’s resume.
            2. A job description.

            ---

            Here is the resume:

            ${resumeText}

            ---

            Here is the job description:

            ${jobDescription}

            ---



    `

    const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{
            role: "user", parts: [{text: Prompt}]
        }],
        config: {
            temperature: 0.9,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    match_score: {
                        type: Type.STRING,
                    
                    },
                    summary: {
                        type: Type.STRING
                    },
                    strengths: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        }
                    },
                    missing_skills: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        }
                    },
                    weak_points: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        }
                    },
                    suggestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        }
                    }
                }
            }
        }
    })

    const result = response.text;
    
    const mainString = JSON.parse(result ?? "");
    console.log(mainString);
    

    
    return mainString;

 
}






export async function POST(req: NextRequest) {

    const supabase = await createClientServer();
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    const data = await req.formData();
    const file: File| null = data.get("resume") as unknown as File;
    const filename = file.name;
    const jobDesc: string = data.get("jobDesc") as unknown as string;
    const loader = new PDFLoader(file);
    const docs = await loader.load();
    const resumeText = docs[0].pageContent;


    

    
    const [tailoredJobDescription, feedback] = await Promise.all([
        await descTailor({jobDesc: jobDesc}),
        await aifeedback({resumeText: resumeText, jobDescription: jobDesc})

    ])

    const [resumeRes, jdRes] = await Promise.all([
        await supabase.from("resume").insert({
        filename: filename,
        text: resumeText,
        user_id: userId

    }).select('id').single(),

    await supabase.from("job_desc").insert({
        title: tailoredJobDescription.title,
        company_name: (tailoredJobDescription.company ===null ? "N/A": tailoredJobDescription.company),
        description: tailoredJobDescription.description,
        user_id: userId
    }).select('id').single()

    ])

    if(resumeRes.error || jdRes.error){
        console.error("Got an Insertion error", resumeRes.error || jdRes.error);
    }
        const resumeId = resumeRes.data?.id;
        const jdId = jdRes.data?.id;
      
    


    const {data: analysisData, error:analysicError} = await supabase.from("analysis_result").insert({
        match_score: feedback.match_score,
        summary: feedback.summary,
        strengths: feedback.strengths,
        missing_skills: feedback.missing_skills,
        weak_points: feedback.weak_points,
        resume_id: resumeId,
        desc_id: jdId,
        company_name: tailoredJobDescription.company,
        job_role: tailoredJobDescription.title,
        user_id: user.data.user?.id

    }).select('id').single();
    if(analysicError){
        console.error("Interst error", analysicError)
    } 
    const analysisId = analysisData?.id;
    


    if(!file){
        return NextResponse.json({success: false})
    }

    return NextResponse.json({success: true, analysisId})

    
  }