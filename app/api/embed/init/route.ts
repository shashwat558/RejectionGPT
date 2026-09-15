import { NextRequest } from "next/server";
import { z } from "zod";
import { embedAndStore } from "@/lib/services/embedding.service";
import { requireUser } from "@/lib/api/auth";
import { fail, handleApiError, ok, requestId } from "@/lib/api/response";
import { logger } from "@/lib/logger";

const bodySchema = z.object({
  resumeId: z.string().uuid(),
  jdId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
    const rid = requestId();
    try {
        await requireUser();
        const json = await req.json().catch(() => null);
        const parsed = bodySchema.safeParse(json);
        if (!parsed.success) {
            return fail("Validation error: resumeId and jdId (uuid) required", { status: 400, requestId: rid });
        }
        const { resumeId, jdId } = parsed.data;

        await embedAndStore({ resumeId, jdId });
        return ok({ embedded: true }, { requestId: rid });
    } catch (error) {
        logger.error("[embed/init] error", { requestId: rid, error: String(error) });
        return handleApiError(error, rid);
    }
}
