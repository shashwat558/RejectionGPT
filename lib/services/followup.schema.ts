import { z } from "zod";

export const followupBodySchema = z.object({
  interviewId: z.string().uuid(),
  questionId: z.string().uuid(),
  questionText: z.string().min(1).max(2000),
  answer: z.string().max(10000).optional().default(""),
  /** 0 = first probe for this question; max 1 (≤2 follow-ups/question enforced). */
  followupNumber: z.number().int().min(0).max(1).optional().default(0),
  history: z.array(z.object({
    prompt: z.string().max(2000),
    answer: z.string().max(10000),
  })).max(6).optional().default([]),
  role: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
});

export type FollowupBody = z.infer<typeof followupBodySchema>;
