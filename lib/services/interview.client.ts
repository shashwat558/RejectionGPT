import type {
  InterviewResponse,
  InterviewCreationRequest,
  InterviewCreationResult,
} from "@/lib/types/interview"

export async function createInterviewSession(
  analysisId: string
): Promise<InterviewCreationResult> {
  const response = await fetch("/api/questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ analysisId } as InterviewCreationRequest),
  })

  if (!response.ok) {
    throw new Error("Failed to create interview session")
  }

  const result = await response.json()
  return {
    interviewId: result.interviewId,
    isCompleted: result.isCompleted,
  }
}

export async function submitInterviewResponses(
  responses: InterviewResponse[],
  interviewId: string
): Promise<void> {
  const response = await fetch("/api/interview/result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ responses, interviewId }),
  })

  if (!response.ok) {
    throw new Error("Failed to submit interview responses")
  }
}

export async function startInterviewSession(interviewId: string): Promise<{ started_at: string }> {
  const res = await fetch("/api/interview/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interviewId }),
  });
  if (!res.ok) throw new Error("Failed to start interview");
  const json = await res.json();
  return json.data;
}

export interface AnswerPayload {
  questionId: string;
  answerText: string;
  timeSpent: number;
  /** Client-generated UUID for follow-up linkage (parents first at insert). */
  clientId?: string;
  /** Parent answer clientId — set only on follow-up turns. */
  followupOf?: string | null;
  /** The interviewer's follow-up question text — set only on follow-up turns. */
  promptText?: string | null;
}

export async function saveInterviewAnswers(
  interviewId: string,
  answers: AnswerPayload[]
): Promise<void> {
  const res = await fetch("/api/interview/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interviewId, answers }),
  });
  if (!res.ok) throw new Error("Failed to save answers");
}

export interface FollowupRequest {
  interviewId: string;
  questionId: string;
  questionText: string;
  answer: string;
  followupNumber: number;
  history?: { prompt: string; answer: string }[];
}

export interface FollowupResult {
  type: "followup" | "next";
  text?: string;
}

/** Ask the agent whether to probe deeper or move on. Degrades to next on any failure. */
export async function requestInterviewFollowup(req: FollowupRequest): Promise<FollowupResult> {
  try {
    const res = await fetch("/api/interview/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    const json = await res.json().catch(() => null);
    const data = json?.data ?? {};
    if (!res.ok || (data.type !== "followup" && data.type !== "next")) return { type: "next" };
    if (data.type === "followup" && !data.text?.trim()) return { type: "next" };
    return data as FollowupResult;
  } catch {
    return { type: "next" };
  }
}
