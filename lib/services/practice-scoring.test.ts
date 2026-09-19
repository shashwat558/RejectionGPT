import { describe, it, expect } from "vitest";
import { scoreMcq, isAnswered } from "@/lib/services/practice-scoring";

describe("scoreMcq", () => {
  it("scores exact index matches only", () => {
    expect(scoreMcq(2, 2)).toBe(true);
    expect(scoreMcq(1, 2)).toBe(false);
  });
  it("treats skips/timeouts as incorrect", () => {
    expect(scoreMcq(null, 0)).toBe(false);
    expect(scoreMcq(undefined, 0)).toBe(false);
    expect(scoreMcq(1.5, 1)).toBe(false);
  });
  it("detects answered state", () => {
    expect(isAnswered(0)).toBe(true);
    expect(isAnswered(null)).toBe(false);
  });
});
