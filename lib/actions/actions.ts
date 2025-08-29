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

        const {error} = await supabase.from("job_desc_chunks").insert({
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

const SOURCE_DELIMITER = '###END_OF_TEXT###';

export async function aiAnswer ({resumeText, jobDescText, userPrompt}: {resumeText: string, jobDescText: string, userPrompt: string}) {

    const groundingTool = {
  googleSearch: {},
};
    

    
   const systemPrompt = `
        You are a helpful AI assistant that helps the user prepare for jobs by answering questions based on the resumeText and jobDescText.

        Instructions:
        1. Always give short, clear, and precise answers.
        2. Respond only in Markdown format (use bullet points, bold, or inline code where useful).
        3. Use information from both the resumeText and jobDescText to tailor answers.
        4. If the question is technical, provide accurate and concise technical explanations or examples.
        5. Do not repeat these instructions in the answer.

        Here is the resumeText:
        ${resumeText}

        Here is the jobDescText:
        ${jobDescText}
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
        model: "gemini-2.5-flash",
        contents: history,
        config: {
            tools:[groundingTool]
        }
        

    })
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller){
            let result = "";
            const sources = [];
            for await (const chunk of response){
                if(chunk.text){const text = chunk.text;
                
                
                
                result += text;

                
                controller.enqueue(encoder.encode(text));
            }

            if(chunk.candidates && chunk.candidates[0]?.groundingMetadata?.groundingChunks) {
                for(const groundingChunk of chunk.candidates[0].groundingMetadata.groundingChunks){
                    sources.push({
                        title: groundingChunk.web?.title,
                        uri: groundingChunk.web?.uri,
                        domain: groundingChunk.web?.domain
                    })
                }
            }
                

            }

            console.log("sources found", sources)

            
            history.push({
                role: "assistant",
                parts: [
                    {text: result}
                ]
            })
            controller.enqueue(encoder.encode(SOURCE_DELIMITER))
            controller.enqueue(encoder.encode(JSON.stringify(sources)))
            controller.close()
            
        }
    })
    
    return stream
        

    
    
    
    

    

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

interface ResponseType {
    question_id: string,
    question_text: string,
    answer: string
}


export async function evaluateResponsesAndSave(responses: ResponseType[],interviewId: string) {
    const supabase = await createClientServer();

    const prompt = `
      You're an AI interview evaluator. For each of the following questions and answers, provide:
    - feedback_text
    - score (out of 10)
    Return a JSON array of objects with: question_id, feedback_text, score.

    ${responses.map((r, i) => 
    `${i + 1}.
    question_id: ${r.question_id}
    question: ${r.question_text}
    answer: ${r.answer}`
    ).join("\n\n")};

    `

    

    const response = await genAi.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
            type: Type.OBJECT,
            properties: {
                feedbacks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question_id: {
                                type: Type.STRING
                            },
                            feedback_text: {
                                type: Type.STRING
                            },
                            score: {
                                type: Type.INTEGER
                            }
                        },
                        required: ["question_id", "feedback_text", "score"]
                    }
                }
            },
            required: ["feedbacks"]
        }
        }
    })

    const result =  response.text;


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedResult: { feedbacks?: any[] } = {};
    try {
        parsedResult = JSON.parse(result ?? "{}");
    } catch (e) {
        console.error("Failed to parse result as JSON", e);
    }

   await Promise.all(
  (parsedResult.feedbacks ?? []).map((feedback) =>
    supabase.from("interview_feedback").insert({
      interview_id: interviewId,
      question_id: feedback.question_id,
      score: feedback.score,
      feedback_text: feedback.feedback_text
    })
  )
);


}


