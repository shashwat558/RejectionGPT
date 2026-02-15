import { NextRequest, NextResponse } from "next/server"
import { createClientServer } from "@/lib/utils/supabase/server"
import { evaluateAndSaveResponses } from "@/lib/services/interview.service"

export async function POST(req: NextRequest) {
  try {
    const { responses, interviewId } = await req.json()

    if (!responses || responses.length === 0) {
      return NextResponse.json(
        { error: "Missing responses" },
        { status: 400 }
      )
    }

    if (!interviewId) {
      return NextResponse.json(
        { error: "Missing interviewId" },
        { status: 400 }
      )
    }

    const supabase = await createClientServer()
    await evaluateAndSaveResponses(supabase, responses, interviewId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[interview/result] error", error)
    return NextResponse.json(
      { success: false, error: "Failed to evaluate responses" },
      { status: 500 }
    )
  }
}