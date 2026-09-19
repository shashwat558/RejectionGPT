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

export interface InterviewFollowup {
  type: "followup" | "next";
  text?: string;
}

/**
 * Adaptive follow-up decision for a live interview turn.
 * Returns { type: "next" } when the answer is empty/skipped/complete —
 * callers degrade to "next" on any failure so the interview never blocks.
 */
export async function generateInterviewFollowup({
  question,
  answer,
  history = [],
  role,
  company,
}: {
  question: string;
  answer: string;
  history?: { prompt: string; answer: string }[];
  role?: string;
  company?: string;
}): Promise<InterviewFollowup> {
  const q = question.slice(0, 2000);
  const a = answer.slice(0, 10000);
  if (!q.trim() || !a.trim()) return { type: "next" };

  const genAI = getGenAI();
  const historyText = history
    .slice(-6)
    .map((h, i) => `Turn ${i + 1} — Asked: ${h.prompt.slice(0, 500)} / Answered: ${h.answer.slice(0, 1000)}`)
    .join("\n");

  const prompt = `
You are a senior hiring manager conducting a live interview${role ? ` for a ${role}` : ""}${company ? ` at ${company}` : ""}.

You just asked:
Question: ${q}

The candidate answered:
${a}
${historyText ? `\nEarlier this interview:\n${historyText}\n` : ""}
Decide your next move. Return JSON { "type": "followup" | "next", "text"?: string }.
- "next" when: the answer is empty, gibberish, a skip, or already thorough and complete.
- "followup" when: a short probe would reveal depth. "text" must be ONE probing question (1-2 sentences), conversational, building on the candidate's exact words.

Rules:
- Never reveal scores, verdicts, or evaluations.
- Never repeat the original question verbatim.
- Never ask more than one question in "text".
`

  try {
    const response = await genAI.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            text: { type: Type.STRING },
          },
          required: ["type"],
        },
      },
    });

    const parsed = safeParseJson<{ type?: string; text?: string }>(response.text, "generateInterviewFollowup");
    if (parsed.type !== "followup" || !parsed.text?.trim()) return { type: "next" };
    return { type: "followup", text: parsed.text.trim().slice(0, 1000) };
  } catch (e) {
    logger.error("generateInterviewFollowup failed, degrading to next", { error: String(e) });
    return { type: "next" };
  }
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

export interface PracticeMcq {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface PracticeDsa {
  title: string;
  prompt: string;
  editorial: string;
  hints: string[];
}

export type PracticeGenerated = PracticeMcq[] | PracticeDsa[];

const PRACTICE_DIFFICULTY_GUIDE: Record<string, string> = {
  easy: "fundamentals a first-year student should know; single concept, no tricks.",
  medium: "typical campus-placement / mass-recruiter difficulty; one twist, still solvable in minutes.",
  hard: "product-company screening difficulty; multi-step reasoning or edge cases.",
};

/**
 * Generate a track-based practice set. MCQ tracks return questions with
 * options + correct_index + explanation; DSA returns problem + editorial.
 * Throws on invalid model output (callers surface a 502).
 */
export async function generatePracticeSet({
  track,
  topic,
  difficulty,
  count,
}: {
  track: "aptitude" | "cs" | "dsa";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
}): Promise<PracticeGenerated> {
  if (!topic.trim()) throw new Error("generatePracticeSet: topic required");
  const n = Math.min(Math.max(Math.floor(count), 1), 10);
  const level = PRACTICE_DIFFICULTY_GUIDE[difficulty] ?? PRACTICE_DIFFICULTY_GUIDE.medium;
  const genAI = getGenAI();

  if (track === "dsa") {
    const prompt = `
You are a DSA coach for Indian campus placements. Create ${n} ORIGINAL practice problems on the pattern "${topic}" at ${difficulty} level (${level}).
Each problem: a clear statement with input/output examples and constraints, solvable with the pattern. Do NOT copy LeetCode problems; write fresh variants.
Return JSON { "questions": [{ "title": string, "prompt": string (markdown, statement + examples + constraints), "editorial": string (approach + complexity, no full code needed but pseudocode ok), "hints": string[2-3] }] }.
`;
    const response = await genAI.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  editorial: { type: Type.STRING },
                  hints: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["title", "prompt", "editorial"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });
    const parsed = safeParseJson<{ questions?: PracticeDsa[] }>(response.text, "generatePracticeSet:dsa");
    const questions = (parsed.questions ?? []).slice(0, n).filter((q) => q.prompt?.trim() && q.editorial?.trim());
    if (!questions.length) throw new Error("generatePracticeSet: empty model response");
    return questions;
  }

  const trackLabel = track === "aptitude" ? "aptitude (quantitative, logical, verbal reasoning like campus placement tests)" : "computer science fundamentals";
  const prompt = `
You are an exam setter for Indian campus placements. Create ${n} multiple-choice questions on "${topic}" (${trackLabel}) at ${difficulty} level (${level}).
Each question: exactly 4 options, exactly one correct, a 1-2 sentence explanation of why the answer is right. No tricks depending on ambiguous wording.
Return JSON { "questions": [{ "prompt": string, "options": string[4], "correct_index": 0-3, "explanation": string }] }.
`;
  const response = await genAI.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: prompt,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correct_index: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ["prompt", "options", "correct_index", "explanation"],
            },
          },
        },
        required: ["questions"],
      },
    },
  });
  const parsed = safeParseJson<{ questions?: PracticeMcq[] }>(response.text, "generatePracticeSet:mcq");

  const questions = (parsed.questions ?? [])
    .slice(0, n)
    .filter(
      (q) =>
        q.prompt?.trim() &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        Number.isInteger(q.correct_index) &&
        q.correct_index >= 0 &&
        q.correct_index < 4 &&
        q.explanation?.trim()
    );
  if (!questions.length) throw new Error("generatePracticeSet: empty model response");
  return questions;
}

export interface StudyPlanPhase {
  title: string;
  weeks: string;
  focus: string;
  tasks: string[];
  practice: { track: string; topic: string }[];
}

/**
 * Generate a phased study plan sized to the student's horizon. Output is
 * validated and practice topics are filtered to known lists by the caller.
 */
export async function generateStudyPlan({
  targetRole,
  tier,
  monthsLeft,
  strengths,
  gaps,
}: {
  targetRole: string;
  tier: string;
  monthsLeft: number;
  strengths: string[];
  gaps: string[];
}): Promise<{ phases: StudyPlanPhase[] }> {
  const horizonWeeks = Math.min(Math.max(monthsLeft * 4, 4), 24);
  const genAI = getGenAI();
  const prompt = `
You are a career coach for Indian engineering students. Build a study plan for a ${tier} college student with ${monthsLeft} months (${horizonWeeks} weeks) to prepare for entry-level "${targetRole}" roles.

Measured strengths: ${strengths.length ? strengths.join("; ") : "none yet"}.
Measured gaps: ${gaps.length ? gaps.join("; ") : "none yet"}.

Rules:
- 4-6 phases covering the full ${horizonWeeks} weeks (label each phase with week ranges like "Weeks 1-3").
- Early phases fix fundamentals and gaps; later phases convert to interview readiness (mocks, timed drills, project proof).
- Each phase: 3-5 concrete tasks (45-60 min/day habit), plus 1-3 practice pointers as {track, topic} where track is one of aptitude|cs|dsa and topic matches standard topics (e.g. Quantitative Aptitude, DBMS & SQL, Arrays, Two Pointers).
- Be honest about competition; no guaranteed-job language.

Return JSON { "phases": [{ "title": string, "weeks": string, "focus": string, "tasks": string[3-5], "practice": [{ "track": string, "topic": string }] }] }.
`;
  const response = await genAI.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: prompt,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          phases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                weeks: { type: Type.STRING },
                focus: { type: Type.STRING },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                practice: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      track: { type: Type.STRING },
                      topic: { type: Type.STRING },
                    },
                    required: ["track", "topic"],
                  },
                },
              },
              required: ["title", "weeks", "focus", "tasks"],
            },
          },
        },
        required: ["phases"],
      },
    },
  });
  const parsed = safeParseJson<{ phases?: StudyPlanPhase[] }>(response.text, "generateStudyPlan");
  const phases = (parsed.phases ?? [])
    .slice(0, 6)
    .map((p) => ({
      title: String(p.title ?? "").slice(0, 200),
      weeks: String(p.weeks ?? "").slice(0, 50),
      focus: String(p.focus ?? "").slice(0, 1000),
      tasks: (Array.isArray(p.tasks) ? p.tasks : []).slice(0, 6).map((t) => String(t).slice(0, 500)),
      practice: (Array.isArray(p.practice) ? p.practice : []).slice(0, 4).map((pr) => ({
        track: String(pr.track ?? "").slice(0, 20),
        topic: String(pr.topic ?? "").slice(0, 100),
      })),
    }))
    .filter((p) => p.title && p.tasks.length > 0);
  if (phases.length < 2) throw new Error("generateStudyPlan: empty model response");
  return { phases };
}

