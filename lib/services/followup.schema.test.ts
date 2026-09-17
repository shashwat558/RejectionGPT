import { describe, it, expect } from "vitest";
import { followupBodySchema } from "@/lib/services/followup.schema";

describe("followupBodySchema", () => {
  const base = {
    interviewId: "123e4567-e89b-12d3-a456-426614174000",
    questionId: "123e4567-e89b-12d3-a456-426614174001",
    questionText: "Tell me about a conflict you resolved.",
  };
  it("accepts a valid turn with defaults", () => {
    const parsed = followupBodySchema.safeParse({ ...base, answer: "We talked it out." });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.followupNumber).toBe(0);
      expect(parsed.data.history).toEqual([]);
    }
  });
  it("rejects a third follow-up (cap is 2)", () => {
    expect(followupBodySchema.safeParse({ ...base, answer: "x", followupNumber: 2 }).success).toBe(false);
    expect(followupBodySchema.safeParse({ ...base, answer: "x", followupNumber: 1 }).success).toBe(true);
  });
  it("rejects missing ids and oversized answers", () => {
    expect(followupBodySchema.safeParse({ ...base, interviewId: "nope", answer: "x" }).success).toBe(false);
    expect(followupBodySchema.safeParse({ ...base, answer: "x".repeat(10001) }).success).toBe(false);
  });
});
