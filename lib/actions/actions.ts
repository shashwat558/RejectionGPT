"use server"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { FeedbackItem } from "@/components/feedbackSidebar";
import { createClientServer } from "../utils/supabase/server"
import { GoogleGenAI, Type } from "@google/genai";

export async function getFeedback({analysisId}: {analysisId: string}){
    const supabase = await createClientServer();
    console.log(analysisId)
    const {data: feedbackData, error: fetchError} = await supabase.from("analysis_result").select("*").eq("id", analysisId).single();

    if(fetchError || !feedbackData) {
        console.log(fetchError?.message)
        throw new Error("Error fetching")
    }
    console.log(feedbackData);
    return feedbackData;
}

export async function getAllFeedbacks() {

    const supabase = await createClientServer();
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    const {data: allFeedbackData, error: fetchError} = await supabase.from("analysis_result").select("id, job_role, company_name, match_score, createdAt, summary").eq("user_id", userId);

    if(fetchError || !allFeedbackData){
        console.log(fetchError.message);
        throw new Error("Error while fetching data")
    }

    const feedbacks: FeedbackItem[] = allFeedbackData.map((item) => ({
    id: item.id,
    jobTitle: item.job_role,
    company: item.company_name,
    date: new Date(item.createdAt).toLocaleDateString(),
    matchScore: item.match_score,
    description: item.summary
  }));

  return feedbacks;


}

export async function initConversation({
  resumeId,
  jdId,
}: {
  resumeId: string;
  jdId: string;
}) {
  const supabase = await createClientServer();
  const user = await supabase.auth.getUser();

  const { data: existingData, error: fetchError } = await supabase
    .from("conversation")
    .select("id")
    .eq("job_desc_id", jdId)
    .eq("resume_id", resumeId)
    .eq("user_id", user.data.user?.id);

  if (fetchError) {
    throw new Error("Failed to fetch existing conversation");
  }

  if (existingData && existingData.length > 0) {
    return existingData[0].id;
  }

  const { data: chatData, error: insertError } = await supabase
    .from("conversation")
    .insert({
      user_id: user.data.user?.id,
      resume_id: resumeId,
      job_desc_id: jdId,
    })
    .select("id")
    .single();

  if (insertError || !chatData) {
    throw new Error("Insertion error");
  }

  try {
    embedAndStore({ resumeId, jdId });
  } catch (e) {
    console.error("Embedding trigger failed", e);
  }

  return chatData.id;
}

const textSplitter = async (text:string) => {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
    });


    const chunks = await splitter.createDocuments([text]);
    const chunkTexts = chunks.map(doc => doc.pageContent);
    return chunkTexts; 

}

const genAi = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
console.log(process.env.GEMINI_API_KEY + " This is gemini key")

export async function embedAndStore({resumeId, jdId}: {resumeId: string, jdId: string}) {
    const supabase = await createClientServer();
    
    const [resumeData, jobData] = await Promise.all([
        supabase.from("resume").select('text, id').eq('id', resumeId).single()
    , supabase.from("job_desc").select('title, company_name, description, id').eq('id', jdId).single()]);

    console.log(resumeData.data?.id, jobData.data?.id)

    if(resumeData.error || jobData.error){
        const errorMsg = `Error getting data: ${resumeData.error?.message ?? ''} ${jobData.error?.message ?? ''}`;
        throw new Error(errorMsg.trim());
    }

   const [resumeChunk, jobDescChhunk] = await Promise.all([
    textSplitter(resumeData.data.text),
    textSplitter(jobData.data.description + jobData.data.title + jobData.data.company_name)
   ]);

   console.log("these are lengths", resumeChunk.length, jobDescChhunk.length)

   await Promise.all([
    ...resumeChunk.map(async(chunk, i) => {
        const embeddingResponse = await genAi.models.embedContent({
            model: "text-embedding-004",
            contents: chunk
        });
        const embeddingValue = embeddingResponse?.embeddings && embeddingResponse.embeddings[0]?.values;

        const {error} = await supabase.from("resume_chunks").insert({
            chunk_index: i,
            content: chunk,
            embedding: embeddingValue,
            resume_id: resumeData.data.id
        });
        if(error){
            console.log(error.details + "This is resue error")
        }
    }), 
    ...jobDescChhunk.map(async(chunk, i) => {
        
        const embeddingResponse = await genAi.models.embedContent({
            model: "text-embedding-004",
            contents: chunk
        });
        const embeddingValue = embeddingResponse.embeddings && embeddingResponse.embeddings[0].values;
        console.log(embeddingValue)

        const {data, error} = await supabase.from("job_desc_chunks").insert({
            content: chunk,
            chunk_index: i,
            embedding: embeddingValue,
            job_desc_id: jobData.data.id
        }).select('id');

        if(error){
            console.log(error.message + "This is jd error")
        }
        
    })
   ])





    
}

export async function aiAnswer ({resumeText, jobDescText, userPrompt}: {resumeText: string, jobDescText: string, userPrompt: string}) {
    

    
    const systemPrompt = `

     you are a helpful ai assistant who will help user in order to get a job by answering the question based on resumeText and jobDescText.

     Note:1) give short and precise answers
          2) give answer in json format


     this is resumeText:
     ${resumeText}

     this is jobDescText: 
     ${jobDescText}

     this is user prompt:
     ${userPrompt}

     example output: 
     json
     {
     answer: "here your response will come"
     }


    `
    const history = [
        {
            role: "user",
            parts: [
                {text: systemPrompt}
            ]

        }
    ]
    history.push({
    role: "user",
    parts: [{text: userPrompt}]
    })
    const response = await genAi.models.generateContentStream({
        model: "gemini-1.5-flash",
        contents: history,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    answer: {
                        type: Type.STRING
                    }
                }
            }
        }
        

    })
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller){
            let result = "";
            for await (const chunk of response){
                const text = chunk.text;
                
                
                
                result += text;

                
                controller.enqueue(encoder.encode(text));
                

            }
            history.push({
                role: "assistant",
                parts: [
                    {text: result}
                ]
            })
            controller.close()
            
        }
    })
   
    return stream;
    
    
    
    

    

}



export async function generateInterviewQuestionsAndSaveToDb({interviewId}: {interviewId: string}) {
    const supabase = await createClientServer();
    


    if(interviewId){

        const {data: interviewData, error} = await supabase.from("interview").select('resume_id, job_desc_id').eq("id", interviewId).single();

        if(error || !interviewData){
            throw new Error(error.message)
        }

        const {resume_id, job_desc_id} = interviewData;

        const [resumeData, jobData] = await Promise.all([
            supabase.from("resume").select('text').eq('id', resume_id).single(),
            supabase.from("job_desc").select("description").eq('id', job_desc_id).single()
        ])

        if(resumeData.error || jobData.error){
            const error = resumeData.error ? resumeData.error : jobData.error;
            throw new Error(error?.message);
        }
        const resumeText = resumeData.data.text;
        const jdText = jobData.data.description;


        try {
          const prompt = `

          You are an interview based on candidate's resumeText and job description text, generate 10 job-specific interview questions covering both behavioral and technical aspects.

          resumeText: 
          ${resumeText}

          job description:
          ${jdText}
      
          
    `
            const response = await genAi.models.generateContent({
                model: "gemini-1.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            questions: {
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
            const sanitizedJsonString = JSON.parse(result ?? "");
            const questions = sanitizedJsonString.questions;
            
            if(questions && questions.length > 0){
                for(let i = 0; i < questions.length; i++) {
                    await supabase.from("interview_questions").insert({
                        interview_id: interviewId,
                        question_text: questions[i],
                        order: i + 1
                    })
                }
            }

           

        } catch (error) {
            console.log(error);
            
        }
    }

}


export async function getInterviewQuestions(interviewId: string) {
    const supabase = await createClientServer();
    const {data: questions, error} = await supabase.from("interview_questions").select("question_text, order, id").eq('interview_id', interviewId).limit(10)

    if(error || !questions){
        throw new Error(error.message);
    }

    

    return questions
}