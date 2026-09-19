import { z } from "zod";

export const generatePracticeBodySchema = z.object({
  track: z.enum(["aptitude", "cs", "dsa"]),
  topic: z.string().min(1).max(100),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  count: z.number().int().min(1).max(10).optional().default(5),
  analysisId: z.string().uuid().optional(),
});

export const attemptPracticeBodySchema = z.object({
  questionId: z.string().uuid(),
  selectedIndex: z.number().int().min(0).max(3).nullable().optional(),
  answerText: z.string().max(10000).optional(),
  timeSpent: z.number().min(0).max(3600).optional().default(0),
});

export type GeneratePracticeBody = z.infer<typeof generatePracticeBodySchema>;
export type AttemptPracticeBody = z.infer<typeof attemptPracticeBodySchema>;
