export async function fetchCalendarStatus() {
  const res = await fetch("/api/calender/status", { method: "GET" })
  if (!res.ok) {
    return false
  }
  const data = await res.json()
  return Boolean(data.connected)
}
