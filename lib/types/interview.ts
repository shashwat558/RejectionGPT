export interface InterviewQuestion {
  id: string
  question_text: string
  order: number
}

export interface InterviewResponse {
  question_id: string
  question_text: string
  answer: string
}

export interface InterviewFeedback {
  feedback_text: string
  score: number
}

export interface InterviewResult {
  question_id: string
  feedback_text: string
  score: number
}

export interface InterviewCreationRequest {
  analysisId: string
}

export interface InterviewCreationResult {
  interviewId: string
  isCompleted?: string
}
