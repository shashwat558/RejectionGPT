import { requireUser } from "@/lib/api/auth";
import { handleApiError, ok, requestId } from "@/lib/api/response";
import { listDiagnostics } from "@/lib/services/diagnostic.service";

export async function GET() {
  const rid = requestId();
  try {
    const { userId } = await requireUser();
    const diagnostics = await listDiagnostics(userId);
    return ok({ diagnostics }, { requestId: rid });
  } catch (error) {
    return handleApiError(error, rid);
  }
}
