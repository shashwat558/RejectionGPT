import { NextResponse } from "next/server";
import { z } from "zod";
import { logger, newRequestId } from "@/lib/logger";

export function requestId(): string {
  return newRequestId();
}

export function ok<T>(data: T, init?: { headers?: HeadersInit; requestId?: string }) {
  const headers = new Headers(init?.headers);
  if (init?.requestId) headers.set("x-request-id", init.requestId);
  return NextResponse.json({ success: true, data, requestId: init?.requestId }, { headers });
}

export function fail(
  message: string,
  opts?: { status?: number; requestId?: string; code?: string }
) {
  return NextResponse.json(
    { success: false, error: message, code: opts?.code, requestId: opts?.requestId },
    {
      status: opts?.status ?? 500,
      headers: opts?.requestId ? { "x-request-id": opts.requestId } : undefined,
    }
  );
}

export function parseBody<T>(body: unknown, schema: z.ZodSchema<T>): T {
  return schema.parse(body);
}

export function safeParseBody<T>(
  body: unknown,
  schema: z.ZodSchema<T>
): { ok: true; data: T } | { ok: false; error: string } {
  const r = schema.safeParse(body);
  if (r.success) return { ok: true, data: r.data };
  return {
    ok: false,
    error: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
  };
}

export function handleApiError(error: unknown, requestId: string, fallback = "Internal Server Error") {
  logger.error("[api] unhandled", { requestId, error: String(error) });
  if (error instanceof z.ZodError) {
    return fail(`Validation error: ${error.issues.map((i) => i.message).join("; ")}`, {
      status: 400,
      requestId,
    });
  }
  if (error instanceof Error && /not found/i.test(error.message)) {
    return fail(error.message, { status: 404, requestId });
  }
  if (error instanceof Error && /unauthorized|authenticated/i.test(error.message)) {
    return fail(error.message, { status: 401, requestId });
  }
  if (error instanceof Error && /forbidden|owner|access/i.test(error.message)) {
    return fail(error.message, { status: 403, requestId });
  }
  return fail(error instanceof Error ? error.message || fallback : fallback, {
    status: 500,
    requestId,
  });
}

// Common schemas
export const uuidSchema = z.string().uuid();
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
