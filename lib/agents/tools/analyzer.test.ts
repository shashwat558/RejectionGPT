import { describe, it, expect } from "vitest";
import { analyzeResumeInput } from "@/lib/agents/tools/analyzer";

describe("analyzeResumeInput", () => {
  it("accepts valid input with default filename", () => {
    const parsed = analyzeResumeInput.safeParse({
      resumeText: "Senior engineer with 5 years...",
      jobDescription: "We are hiring a senior engineer to build...",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.filename).toBe("resume.pdf");
  });

  it("rejects short job descriptions", () => {
    const parsed = analyzeResumeInput.safeParse({ resumeText: "x".repeat(10), jobDescription: "short" });
    expect(parsed.success).toBe(false);
  });

  it("rejects empty resume", () => {
    const parsed = analyzeResumeInput.safeParse({ resumeText: "", jobDescription: "A valid job description here" });
    expect(parsed.success).toBe(false);
  });
});
