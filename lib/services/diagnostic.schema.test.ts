import { describe, it, expect } from "vitest";
import {
  startDiagnosticBodySchema,
  completeDiagnosticBodySchema,
  exportRoadmapBodySchema,
} from "@/lib/services/diagnostic.schema";

describe("startDiagnosticBodySchema", () => {
  it("accepts tier + horizon", () => {
    expect(startDiagnosticBodySchema.safeParse({ tier: "tier2", monthsLeft: 3 }).success).toBe(true);
  });
  it("rejects bad tier and out-of-range horizons", () => {
    expect(startDiagnosticBodySchema.safeParse({ tier: "ivy", monthsLeft: 3 }).success).toBe(false);
    expect(startDiagnosticBodySchema.safeParse({ tier: "tier1", monthsLeft: 0 }).success).toBe(false);
    expect(startDiagnosticBodySchema.safeParse({ tier: "tier1", monthsLeft: 36 }).success).toBe(false);
  });
});

describe("complete/export schemas", () => {
  const id = "123e4567-e89b-12d3-a456-426614174000";
  it("accepts optional role override", () => {
    expect(completeDiagnosticBodySchema.safeParse({}).success).toBe(true);
    expect(completeDiagnosticBodySchema.safeParse({ targetRole: "qa-test" }).success).toBe(true);
  });
  it("requires a uuid analysis", () => {
    expect(exportRoadmapBodySchema.safeParse({ analysisId: id }).success).toBe(true);
    expect(exportRoadmapBodySchema.safeParse({ analysisId: "nope" }).success).toBe(false);
  });
});
