import { NextRequest } from "next/server";
import { getDiagnostic, getDiagnosticProgress } from "@/lib/services/diagnostic.service";
import { requireUser } from "@/lib/api/auth";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rid = requestId();
  try {
    const { id } = await params;
    if (!id) return fail("Diagnostic id required", { status: 400, requestId: rid });
    const { userId } = await requireUser();
    const [diagnostic, progress] = await Promise.all([
      getDiagnostic(userId, id),
      getDiagnosticProgress(userId, id).catch(() => null),
    ]);
    return ok({ diagnostic, progress: progress?.sets ?? [] }, { requestId: rid });
  } catch (error) {
    return handleApiError(error, rid);
  }
}
