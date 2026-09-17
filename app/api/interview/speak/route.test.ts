import { describe, it, expect } from "vitest";
import { speakBodySchema } from "@/lib/services/speak.schema";

describe("speakBodySchema", () => {
  const id = "123e4567-e89b-12d3-a456-426614174000";
  it("accepts valid interviewId + text", () => {
    expect(speakBodySchema.safeParse({ interviewId: id, text: "Tell me about yourself." }).success).toBe(true);
  });
  it("rejects empty text and bad uuid", () => {
    expect(speakBodySchema.safeParse({ interviewId: "nope", text: "hi" }).success).toBe(false);
    expect(speakBodySchema.safeParse({ interviewId: id, text: "  " }).success).toBe(false);
    expect(speakBodySchema.safeParse({ interviewId: id, text: "x".repeat(2001) }).success).toBe(false);
  });
});
