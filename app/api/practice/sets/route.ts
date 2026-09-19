import { listPracticeSets, getPracticeStats } from "@/lib/services/practice.service";
import { requireUser } from "@/lib/api/auth";
import { handleApiError, ok, requestId } from "@/lib/api/response";

export async function GET() {
  const rid = requestId();
  try {
    const { userId } = await requireUser();
    const [sets, stats] = await Promise.all([
      listPracticeSets(userId),
      getPracticeStats(userId).catch(() => []),
    ]);
    return ok({ sets, stats }, { requestId: rid });
  } catch (error) {
    return handleApiError(error, rid);
  }
}
