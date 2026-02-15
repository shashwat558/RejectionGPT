import type { ParsedResumeData } from "@/lib/types/resume"

export async function parseResumeOnClient(file: File): Promise<ParsedResumeData> {
  const formData = new FormData()
  formData.set("file", file)

  const response = await fetch("/api/parse-pdf", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Resume parsing failed")
  }

  const result = await response.json()
  return result.json
}

export async function uploadAndAnalyze(
  resume: File,
  jobDesc: string
): Promise<{ analysisId: string }> {
  const formData = new FormData()
  formData.set("resume", resume)
  formData.set("jobDesc", jobDesc)

  const response = await fetch("/api/analyzer", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Analysis failed")
  }

  const result = await response.json()
  const analysisId = result.analysisId

  if (!analysisId) {
    throw new Error("Missing analysisId in response")
  }

  return { analysisId }
}
