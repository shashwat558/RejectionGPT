export interface ParsedResumeData {
  [key: string]: unknown
}

export interface ResumeUploadRequest {
  file: File
  jobDesc: string
  userId: string
}

export interface ResumeUploadResult {
  analysisId: string
}
