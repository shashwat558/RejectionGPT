import { NextRequest, NextResponse } from "next/server"
import Redis from "ioredis"
import { createAnalysisFromUpload } from "@/lib/services/analytics.service"
import { createClientServer } from "@/lib/utils/supabase/server"

const redis = new Redis(process.env.REDIS_URL!)
const LIMIT = 10
const DURATION = 60






export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip")
    const key = `rate-limit:${ip}`

    const current = await redis.incr(key)
    if (current === 1) {
        await redis.expire(key, DURATION)
    }
    if (current > LIMIT) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const supabase = await createClientServer()
    const user = await supabase.auth.getUser()
    const userId = user.data.user?.id

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.formData()
    const file = data.get("resume") as File | null
    const jobDesc = (data.get("jobDesc") as string) || ""

    if (!file) {
        return NextResponse.json({ error: "Missing resume" }, { status: 400 })
    }

    try {
        const { analysisId } = await createAnalysisFromUpload({ file, jobDesc, userId })
        return NextResponse.json({ success: true, analysisId })
    } catch (error) {
        console.error("[analyzer] error", error)
        return NextResponse.json({ success: false, error: "Failed to analyze" }, { status: 500 })
    }
}