import { z } from "zod";

export const startDiagnosticBodySchema = z.object({
  tier: z.enum(["tier1", "tier2", "tier3", "other"]),
  monthsLeft: z.number().int().min(1).max(24),
});

export const completeDiagnosticBodySchema = z.object({
  targetRole: z.string().min(1).max(50).optional(),
});

export const exportRoadmapBodySchema = z.object({
  analysisId: z.string().uuid(),
});

export type StartDiagnosticBody = z.infer<typeof startDiagnosticBodySchema>;
