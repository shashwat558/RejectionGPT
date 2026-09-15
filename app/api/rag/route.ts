import { NextResponse } from "next/server";

/**
 * Removed: RAG is handled via /api/chat/message + /api/embed/init.
 * Kept as 410 Gone so old clients fail loudly instead of silently.
 */
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Gone: use /api/chat/message", code: "GONE" },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Gone: use /api/chat/message", code: "GONE" },
    { status: 410 }
  );
}
