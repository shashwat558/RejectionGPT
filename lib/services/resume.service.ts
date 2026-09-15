import { getGenAI, ANALYSIS_MODEL } from "@/lib/ai"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import type { ParsedResumeData } from "@/lib/types/resume"

export async function parseResumePDF(file: File): Promise<ParsedResumeData> {
  const genAI = getGenAI();
  const loader = new PDFLoader(file)
  const docs = await loader.load()
  const mainContent = docs[0].pageContent

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
  const parsedData = JSON.parse(sanitizedJsonString ?? "{}")

  return parsedData
}
