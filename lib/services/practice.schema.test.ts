import { describe, it, expect } from "vitest";
import { generatePracticeBodySchema, attemptPracticeBodySchema } from "@/lib/services/practice.schema";
import { topicsForTrack } from "@/lib/types/practice";

describe("generatePracticeBodySchema", () => {
  it("applies difficulty/count defaults", () => {
    const parsed = generatePracticeBodySchema.safeParse({ track: "aptitude", topic: "Quantitative Aptitude" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.difficulty).toBe("medium");
      expect(parsed.data.count).toBe(5);
    }
  });
  it("rejects bad tracks, topics, and counts", () => {
    expect(generatePracticeBodySchema.safeParse({ track: "gmat", topic: "x" }).success).toBe(false);
    expect(generatePracticeBodySchema.safeParse({ track: "cs", topic: "" }).success).toBe(false);
    expect(generatePracticeBodySchema.safeParse({ track: "dsa", topic: "Arrays", count: 50 }).success).toBe(false);
  });
});

describe("attemptPracticeBodySchema", () => {
  const qid = "123e4567-e89b-12d3-a456-426614174000";
  it("accepts MCQ picks and DSA approaches", () => {
    expect(attemptPracticeBodySchema.safeParse({ questionId: qid, selectedIndex: 2, timeSpent: 30 }).success).toBe(true);
    expect(attemptPracticeBodySchema.safeParse({ questionId: qid, answerText: "Use two pointers…", timeSpent: 120 }).success).toBe(true);
    expect(attemptPracticeBodySchema.safeParse({ questionId: qid, selectedIndex: null, timeSpent: 60 }).success).toBe(true);
  });
  it("rejects out-of-range picks", () => {
    expect(attemptPracticeBodySchema.safeParse({ questionId: qid, selectedIndex: 4 }).success).toBe(false);
    expect(attemptPracticeBodySchema.safeParse({ questionId: "nope" }).success).toBe(false);
  });
});

describe("topicsForTrack", () => {
  it("covers all three tracks", () => {
    expect(topicsForTrack("aptitude").length).toBeGreaterThan(0);
    expect(topicsForTrack("cs")).toContain("DBMS & SQL");
    expect(topicsForTrack("dsa")).toContain("Two Pointers");
  });
});
