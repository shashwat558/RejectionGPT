export interface AnalysisSummary {
  id: string
  jobTitle: string
  company: string
  date: string
  matchScore: string
  description?: string
  dsaQuestionCreated?: boolean
}

export interface AnalysisDetail {
  id: string
  resume_id: string
  desc_id: string
  match_score: number
  summary: string
  strengths: string[]
  missing_skills: string[]
  weak_points: string[]
}

export interface JobInfo {
  title: string
  company: string
  description: string
}

export interface ResumeAnalysisResult {
  match_score: string
  summary: string
  strengths: string[]
  missing_skills: string[]
  weak_points: string[]
}
