import { getGenAI, ANALYSIS_MODEL } from "@/lib/ai"
import { extractPdfText } from "@/lib/services/pdf"
import { logger } from "@/lib/logger"
import type { ParsedResumeData } from "@/lib/types/resume"

export async function parseResumePDF(file: File): Promise<ParsedResumeData> {
  const genAI = getGenAI();
  const { text: mainContent } = await extractPdfText(file);

  const prompt = `
Extract the following resume text into structured JSON with fields.

this is resume text:
${mainContent}
`

  const response = await genAI.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: prompt,
  })

  const result = response.text
  const match = result?.match(/```json\s*([\s\S]*?)```/)
  const jsonString = match ? match[1].trim() : result?.trim()
  const sanitizedJsonString = jsonString?.replace(/[\x00-\x1F\x7F]/g, "")
  try {
    return JSON.parse(sanitizedJsonString ?? "{}") as ParsedResumeData;
  } catch {
    logger.error("[resume] parse returned invalid JSON");
    throw new Error("Failed to parse resume");
  }
}
