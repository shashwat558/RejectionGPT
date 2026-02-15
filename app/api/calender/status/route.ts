import { NextResponse } from "next/server"
import { createClientServer } from "@/lib/utils/supabase/server"
import { getCalendarConnectionStatus } from "@/lib/services/calendar.service"

export async function GET() {
  try {
    const supabase = await createClientServer()
    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      return NextResponse.json({ connected: false }, { status: 401 })
    }

    const connected = await getCalendarConnectionStatus(supabase, user.id)
    return NextResponse.json({ connected })
  } catch (error) {
    console.error("[calendar/status] error", error)
    return NextResponse.json({ connected: false }, { status: 500 })
  }
}
