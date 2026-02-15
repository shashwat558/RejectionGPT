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
