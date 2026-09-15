import { GoogleGenAI, Type } from "@google/genai"
import type { JobInfo, ResumeAnalysisResult } from "@/lib/types/analytics"
import type { ChatHistoryEntry, ChatSource } from "@/lib/types/chat"
import type { InterviewResponse, InterviewFeedback } from "@/lib/types/interview"
import { CHAT_SOURCE_DELIMITER } from "@/lib/types/chat"
import { logger } from "@/lib/logger"

export const EMBEDDING_MODEL = "gemini-embedding-001";
export const CHAT_MODEL = "gemini-2.5-flash";
export const ANALYSIS_MODEL = "gemini-2.0-flash";

let cachedClient: GoogleGenAI | null = null;

/**
 * Server-only GenAI client. BYOK cookie flow removed — keys come from
 * server env only (GEMINI_API_KEY). Throws if unconfigured.
 */
export function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

function safeParseJson<T>(raw: string | undefined, label: string): T {
  const text = (raw ?? "").trim();
  if (!text) throw new Error(`${label}: empty model response`);
  // Prefer fenced json, fall back to raw
  const match = text.match(/```json\s*([\s\S]*?)```/)
  const jsonString = (match ? match[1].trim() : text).replace(/[\x00-\x1F\x7F]/g, "");
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    logger.error(`[ai] JSON parse failed`, { label });
    throw new Error(`${label}: invalid JSON from model`);
  }
}

export async function extractJobInfo(jobDesc: string): Promise<JobInfo> {
  if (!jobDesc || jobDesc.trim().length < 10) {
    throw new Error("extractJobInfo: job description too short");
  }
  const genAI = getGenAI();
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
    model: ANALYSIS_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  })

  return safeParseJson<JobInfo>(response.text, "extractJobInfo")
}

export async function generateResumeAnalysis({
  resumeText,
  jobDescription,
}: {
  resumeText: string
  jobDescription: string
}): Promise<ResumeAnalysisResult> {
  if (!resumeText?.trim() || !jobDescription?.trim()) {
    throw new Error("generateResumeAnalysis: resume and job description required");
  }
  const genAI = getGenAI();
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
    model: ANALYSIS_MODEL,
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

  return safeParseJson<ResumeAnalysisResult>(response.text, "generateResumeAnalysis")
}

export async function embedText(text: string) {
  if (!text?.trim()) throw new Error("embedText: empty input");
  const genAI = getGenAI();
  const embeddingResponse = await genAI.models.embedContent({
    model: EMBEDDING_MODEL,
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
  if (!userPrompt?.trim()) throw new Error("streamChatAnswer: empty prompt");
  if (userPrompt.length > 8000) throw new Error("streamChatAnswer: prompt too long");
  // Cap context to avoid token blowups
  const resume = resumeText.slice(0, 5);
  const jd = jobDescText.slice(0, 5);
  const history = conversationHistory.slice(-20);
  const genAI = getGenAI();
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
${resume.join("\n\n")}

Here is the jobDescText:
${jd.join("\n\n")}
`

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    ...history,
    { role: "user", parts: [{ text: userPrompt }] },
  ]

  const response = await genAI.models.generateContentStream({
    model: CHAT_MODEL,
    contents,
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
  if (!resumeText?.trim() || !jobDescription?.trim()) {
    throw new Error("generateInterviewQuestions: resume and JD required");
  }
  const genAI = getGenAI();
  const prompt = `
You are an interview based on candidate's resumeText and job description text, generate 10 job-specific interview questions covering both behavioral and technical aspects.

resumeText:
${resumeText}

job description:
${jobDescription}
`

  const response = await genAI.models.generateContent({
    model: ANALYSIS_MODEL,
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

  const parsedResult = safeParseJson<{ questions?: string[] }>(response.text, "generateInterviewQuestions")
  return parsedResult.questions ?? []
}

export async function evaluateInterviewResponses(
  responses: InterviewResponse[]
): Promise<InterviewFeedback[]> {
  if (!responses?.length) return [];
  if (responses.length > 20) throw new Error("evaluateInterviewResponses: too many responses");
  const genAI = getGenAI();
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
    model: ANALYSIS_MODEL,
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

  try {
    const parsedResult = safeParseJson<{ feedbacks?: InterviewFeedback[] }>(response.text, "evaluateInterviewResponses")
    return parsedResult.feedbacks ?? []
  } catch (e) {
    logger.error("Failed to parse interview evaluation result", { error: String(e) })
    return []
  }
}

