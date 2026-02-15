import { NextRequest, NextResponse } from "next/server"
import { createClientServer } from "@/lib/utils/supabase/server"
import { createInterview } from "@/lib/services/interview.service"

export async function POST(req: NextRequest) {
  try {
    const { analysisId } = await req.json()

    if (!analysisId) {
      return NextResponse.json(
        { error: "Missing analysisId" },
        { status: 400 }
      )
    }

    const supabase = await createClientServer()
    const result = await createInterview(supabase, analysisId)

    return NextResponse.json({
      success: true,
      interviewId: result.interviewId,
      isCompleted: result.isCompleted,
    })
  } catch (error) {
    console.error("[questions] error", error)
    return NextResponse.json(
      { success: false, error: "Failed to create interview" },
      { status: 500 }
    )
  }
}