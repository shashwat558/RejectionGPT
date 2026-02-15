import { SupabaseClient } from "@supabase/supabase-js"

export async function getCalendarConnectionStatus(
  supabase: SupabaseClient,
  userId: string
) {
  const { data: calendarData, error } = await supabase
    .from("user_integrations")
    .select("access_token, expiry_date")
    .eq("user_id", userId)
    .eq("provider", "google_calender")
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (calendarData?.access_token) {
    const isExpired = calendarData.expiry_date && new Date(calendarData.expiry_date) < new Date()
    return !isExpired
  }

  return false
}
