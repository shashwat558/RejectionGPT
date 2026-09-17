import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export const MAX_RESUME_CHARS = 100000;

/**
 * Single PDF extraction entrypoint for all analyzer flows.
 * Joins all pages (old code only used docs[0]), caps length for token safety.
 */
export async function extractPdfText(file: File): Promise<{ text: string; pages: number }> {
  const loader = new PDFLoader(file);
  const docs = await loader.load();
  if (!docs?.length) throw new Error("Failed to read resume content");
  const text = docs
    .map((d) => d.pageContent ?? "")
    .join("\n\n")
    .trim()
    .slice(0, MAX_RESUME_CHARS);
  if (!text) throw new Error("Failed to read resume content");
  return { text, pages: docs.length };
}
