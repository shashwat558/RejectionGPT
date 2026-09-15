import { NextRequest } from "next/server";
import { z } from "zod";
import { requireInterviewOwner } from "@/lib/api/auth";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";

const bodySchema = z.object({ interviewId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return fail("interviewId required", { status: 400, requestId: rid });
    const { supabase } = await requireInterviewOwner(parsed.data.interviewId);
    const { data, error } = await supabase
      .from("interview")
      .update({ started_at: new Date().toISOString(), status: "begin" })
      .eq("id", parsed.data.interviewId)
      .select("started_at")
      .maybeSingle();
    if (error || !data) return fail(error?.message || "Failed to start", { status: 500, requestId: rid });
    return ok({ started_at: data.started_at }, { requestId: rid });
  } catch (e) {
    return handleApiError(e, rid);
  }
}
