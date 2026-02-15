import ShareChatView from "@/components/ShareChatView"
import { createClientServer } from "@/lib/utils/supabase/server"
import { notFound } from "next/navigation"

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClientServer()

  const { data, error } = await supabase
    .from("shared_chat")
    .select("title, messages, created_at")
    .eq("token", token)
    .single()

  if (error || !data) {
    notFound()
  }

  return (
    <div className="chat-shell min-h-screen">
      <ShareChatView
        title={data.title || "Shared chat"}
        createdAt={data.created_at}
        messages={data.messages || []}
      />
    </div>
  )
}
