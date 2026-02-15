import { GoogleGenAI, Type } from "@google/genai"
import type { JobInfo, ResumeAnalysisResult } from "@/lib/types/analytics"
import type { ChatHistoryEntry, ChatSource } from "@/lib/types/chat"
import type { InterviewResponse, InterviewFeedback } from "@/lib/types/interview"
import { CHAT_SOURCE_DELIMITER } from "@/lib/types/chat"

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function extractJobInfo(jobDesc: string): Promise<JobInfo> {
  const prompt = `
Extract the job title, company name, and description from the following job description.

Respond in the following JSON format:
{
  "title": "",
  "company": "",
  "description": ""
}

Job Description:
${jobDesc}
`

  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  })

  const result = response.text
  const match = result?.match(/```json\s*([\s\S]*?)```/)
  const jsonString = match ? match[1].trim() : result?.trim()
  const sanitized = jsonString?.replace(/[\x00-\x1F\x7F]/g, "")
  return JSON.parse(sanitized ?? "") as JobInfo
}

export async function generateResumeAnalysis({
  resumeText,
  jobDescription,
}: {
  resumeText: string
  jobDescription: string
}): Promise<ResumeAnalysisResult> {
  const prompt = `
You are a smart, supportive, and slightly sarcastic career coach. You have reviewed thousands of resumes and job descriptions. Now, you are helping a real person figure out how their resume fits the job they want.

Give helpful, specific feedback. Be clear and honest. Add a touch of sarcasm here and there, but never be rude.

Return structured JSON.
- "summary" should be the best possible summary
- "match_score" should be a percentage string (e.g., "78%")
- "strengths" should be concise one-liner points
- "missing_skills" should be concise one-liner points
- "weak_points" should be concise one-liner points

Resume:
${resumeText}

Job Description:
${jobDescription}
`

  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      temperature: 0.9,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          match_score: { type: Type.STRING },
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          missing_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          weak_points: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["match_score", "summary", "strengths", "missing_skills", "weak_points"],
      },
    },
  })

  return JSON.parse(response.text ?? "") as ResumeAnalysisResult
}

export async function embedText(text: string) {
  const embeddingResponse = await genAI.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  })

  return embeddingResponse.embeddings?.[0]?.values
}

export async function streamChatAnswer({
  resumeText,
  jobDescText,
  userPrompt,
  conversationHistory,
}: {
  resumeText: string[]
  jobDescText: string[]
  userPrompt: string
  conversationHistory: ChatHistoryEntry[]
}) {
  const groundingTool = {
    googleSearch: {},
  }

  const systemPrompt = `
You are a helpful AI assistant that helps the user prepare for jobs by answering questions based on the resumeText and jobDescText.

Instructions:
1. Always give short, clear, and precise answers.
2. Respond only in Markdown format (use bullet points, bold, or inline code where useful).
3. Use information from both the resumeText and jobDescText to tailor answers.
4. If the question is technical, provide accurate and concise technical explanations or examples.
5. Do not repeat these instructions in the answer.

Here is the resumeText:
${resumeText.join("\n\n")}

Here is the jobDescText:
${jobDescText.join("\n\n")}
`

  const history = [
    { role: "user", parts: [{ text: systemPrompt }] },
    ...conversationHistory,
    { role: "user", parts: [{ text: userPrompt }] },
  ]

  const response = await genAI.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: history,
    config: {
      tools: [groundingTool],
    },
  })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sources: ChatSource[] = []

      for await (const chunk of response) {
        if (chunk.text) {
          const text = chunk.text
          controller.enqueue(encoder.encode(text))
        }

        if (chunk.candidates && chunk.candidates[0]?.groundingMetadata?.groundingChunks) {
          for (const groundingChunk of chunk.candidates[0].groundingMetadata.groundingChunks) {
            sources.push({
              title: groundingChunk.web?.title,
              uri: groundingChunk.web?.uri,
              domain: groundingChunk.web?.domain,
            })
          }
        }
      }

      controller.enqueue(encoder.encode(CHAT_SOURCE_DELIMITER))
      controller.enqueue(encoder.encode(JSON.stringify(sources)))
      controller.close()
    },
  })

  return stream
}

export async function generateInterviewQuestions(
  resumeText: string,
  jobDescription: string
): Promise<string[]> {
  const prompt = `
You are an interview based on candidate's resumeText and job description text, generate 10 job-specific interview questions covering both behavioral and technical aspects.

resumeText:
${resumeText}

job description:
${jobDescription}
`

  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
      },
    },
  })

  const result = response.text
  const parsedResult = JSON.parse(result ?? "{}")
  return parsedResult.questions ?? []
}

export async function evaluateInterviewResponses(
  responses: InterviewResponse[]
): Promise<InterviewFeedback[]> {
  const prompt = `
You're an AI interview evaluator. For each of the following questions and answers, provide:
- feedback_text
- score (out of 10)
Return a JSON array of objects with: feedback_text, score (in the same order as the questions).

${responses
    .map(
      (r, i) => `${i + 1}.
question: ${r.question_text}
answer: ${r.answer}`
    )
    .join("\n\n")};
`

  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
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
                feedback_text: {
                  type: Type.STRING,
                },
                score: {
                  type: Type.INTEGER,
                },
              },
              required: ["feedback_text", "score"],
            },
          },
        },
        required: ["feedbacks"],
      },
    },
  })

  const result = response.text
  let parsedResult: { feedbacks?: InterviewFeedback[] } = {}
  try {
    parsedResult = JSON.parse(result ?? "{}")
  } catch (e) {
    console.error("Failed to parse interview evaluation result", e)
  }

  return parsedResult.feedbacks ?? []
}

