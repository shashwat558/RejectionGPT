import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/api/auth';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { fail, handleApiError, requestId } from '@/lib/api/response';
import { logger } from '@/lib/logger';

const bodySchema = z.object({ latex: z.string().min(1).max(200000) });

export async function POST(req: NextRequest) {
  const rid = requestId();
  try {
    await requireUser();
    const ip = getClientIp(req);
    const { allowed, remaining } = await checkRateLimit(`rate-limit:compile:${ip || "unknown"}`, 10, 60);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded", requestId: rid },
        { status: 429, headers: { ...rateLimitHeaders(remaining, 10), "Retry-After": "60" } }
      );
    }
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation error: latex required (max 200k chars)", { status: 400, requestId: rid });
    }
    const { latex } = parsed.data;
    
    const ytotechPayload = {
      compiler: "pdflatex",
      resources: [
        {
          main: true,
          content: latex
        }
      ]
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let response: Response;
    try {
      response = await fetch('https://latex.ytotech.com/builds/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ytotechPayload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      logger.error("LaTeX compilation error", { requestId: rid, error: errorText.slice(0, 500) });
      return fail("Compilation failed", { status: 502, requestId: rid });
    }

    // Proxy the PDF back to the client directly
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      return fail("Compiled PDF too large", { status: 502, requestId: rid });
    }
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="resume.pdf"',
        'x-request-id': rid,
      }
    });

  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return fail("Compilation timed out", { status: 504, requestId: rid });
    }
    return handleApiError(error, rid);
  }
}
