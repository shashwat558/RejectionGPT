import { NextRequest, NextResponse } from "next/server"
import { parseResumePDF } from "@/lib/services/resume.service"

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const parsedData = await parseResumePDF(file)
    return NextResponse.json({ json: parsedData })
  } catch (error) {
    console.error("[parse-pdf] error", error)
    return NextResponse.json(
      { error: "Failed to parse PDF" },
      { status: 500 }
    )
  }
}