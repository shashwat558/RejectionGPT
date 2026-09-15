import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getGenAI, ANALYSIS_MODEL } from '@/lib/ai';
import { requireUser } from '@/lib/api/auth';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { fail, handleApiError, ok, requestId } from '@/lib/api/response';

const bodySchema = z.object({
  latex: z.string().min(1).max(100000),
  instruction: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    await requireUser();
    const ip = getClientIp(req);
    const { allowed, remaining } = await checkRateLimit(`rate-limit:resume-builder:${ip || "unknown"}`, 10, 60);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded", requestId: rid },
        { status: 429, headers: { ...rateLimitHeaders(remaining, 10), "Retry-After": "60" } }
      );
    }
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation error: latex + instruction required", { status: 400, requestId: rid });
    }
    const genAI = getGenAI();
    const { latex, instruction } = parsed.data;

    const prompt = `You are an expert LaTeX resume editor. The user provides an instruction to modify their resume. Update the LaTeX code accordingly. Keep all formatting exactly the same unless instructed otherwise. Output ONLY the updated complete LaTeX code, without any markdown wrapping (e.g. do not wrap in \`\`\`latex \`\`\`). Do not add any explanatory text.

Instruction:
${instruction.slice(0, 5000)}

Current LaTeX:
${latex.slice(0, 90000)}`;

    const response = await genAI.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
    });

    let updatedLatex = response.text || "";
    updatedLatex = updatedLatex.replace(/^```latex\n?/i, "").replace(/```\n?$/i, "").trim().slice(0, 100000);

    return ok({ latex: updatedLatex }, { requestId: rid });

  } catch (error) {
    return handleApiError(error, rid);
  }
}
