import { describe, it, expect } from "vitest";
import { computeRoleFits } from "@/lib/types/diagnostic";

describe("computeRoleFits", () => {
  it("ranks software-dev first on strong DSA", () => {
    const fits = computeRoleFits(
      [
        { track: "aptitude", accuracy: 0.6, answered: 5 },
        { track: "cs", accuracy: 0.6, answered: 5 },
        { track: "dsa", accuracy: 0.9, answered: 2 },
      ],
      []
    );
    expect(fits[0].roleId).toBe("software-dev");
    expect(fits[0].verdict).toBe("fit");
  });
  it("returns unknown with fewer than 2 signaled tracks", () => {
    const fits = computeRoleFits([{ track: "aptitude", accuracy: 0.8, answered: 5 }], []);
    expect(fits.every((f) => f.verdict === "unknown" && f.score === null)).toBe(true);
  });
  it("flags weak topics in heavily-weighted tracks as gaps", () => {
    const fits = computeRoleFits(
      [
        { track: "aptitude", accuracy: 0.4, answered: 5 },
        { track: "cs", accuracy: 0.8, answered: 5 },
        { track: "dsa", accuracy: 0.8, answered: 2 },
      ],
      [
        { track: "aptitude", topic: "Quantitative Aptitude", accuracy: 0.2 },
        { track: "cs", topic: "DBMS & SQL", accuracy: 0.9 },
      ]
    );
    const analyst = fits.find((f) => f.roleId === "product-analyst")!;
    expect(analyst.gaps).toContain("Quantitative Aptitude");
    expect(analyst.gaps).not.toContain("DBMS & SQL");
  });
  it("marks AI/ML bar higher with caveat", () => {
    const fits = computeRoleFits(
      [
        { track: "aptitude", accuracy: 0.6, answered: 5 },
        { track: "cs", accuracy: 0.6, answered: 5 },
        { track: "dsa", accuracy: 0.6, answered: 2 },
      ],
      []
    );
    const aiml = fits.find((f) => f.roleId === "ai-ml")!;
    expect(aiml.verdict).toBe("stretch");
    expect(aiml.caveat).toMatch(/8\+ years/);
  });
});
