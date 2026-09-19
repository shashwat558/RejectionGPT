import { NextRequest } from "next/server";
import { exportPlanToRoadmap } from "@/lib/services/diagnostic.service";
import { requireUser } from "@/lib/api/auth";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";
import { exportRoadmapBodySchema } from "@/lib/services/diagnostic.schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rid = requestId();
  try {
    const { id } = await params;
    if (!id) return fail("Diagnostic id required", { status: 400, requestId: rid });
    const { userId } = await requireUser();
    const json = await req.json().catch(() => null);
    const parsed = exportRoadmapBodySchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation error: analysisId required", { status: 400, requestId: rid });
    }
    const result = await exportPlanToRoadmap({
      userId,
      diagnosticId: id,
      analysisId: parsed.data.analysisId,
      requestId: rid,
    });
    return ok(result, { requestId: rid });
  } catch (error) {
    return handleApiError(error, rid);
  }
}
