import { z } from "zod";
import type { ToolDef } from "@/lib/agents/types";
import { generateStudyPlan, type StudyPlanPhase } from "@/lib/ai";

export const studyPlanInput = z.object({
  targetRole: z.string().min(1).max(100),
  tier: z.string().min(1).max(20),
  monthsLeft: z.number().int().min(1).max(24),
  strengths: z.array(z.string().max(200)).max(20).optional().default([]),
  gaps: z.array(z.string().max(200)).max(20).optional().default([]),
});

export type StudyPlanInput = z.output<typeof studyPlanInput>;

/** Pure-LLM tool: generates a phased study plan. Persistence owned by diagnostic.service. */
export const generateStudyPlanTool: ToolDef<StudyPlanInput, { phases: StudyPlanPhase[] }> = {
  name: "generateStudyPlan",
  description: "Generate a phased study plan sized to the student's horizon",
  inputSchema: studyPlanInput,
  async execute(input) {
    return generateStudyPlan(input);
  },
};
