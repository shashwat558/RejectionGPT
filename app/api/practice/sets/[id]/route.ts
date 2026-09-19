import { NextRequest } from "next/server";
import { getPracticeSetDetail } from "@/lib/services/practice.service";
import { requireUser } from "@/lib/api/auth";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rid = requestId();
  try {
    const { id } = await params;
    if (!id) return fail("Set id required", { status: 400, requestId: rid });
    const { userId } = await requireUser();
    const detail = await getPracticeSetDetail(userId, id);
    return ok(detail, { requestId: rid });
  } catch (error) {
    return handleApiError(error, rid);
  }
}
