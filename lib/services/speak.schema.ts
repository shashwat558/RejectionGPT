import { z } from "zod";

export const speakBodySchema = z.object({
  interviewId: z.string().uuid(),
  text: z.string().trim().min(1).max(2000),
  voice: z.string().max(80).optional(),
});

export type SpeakBody = z.infer<typeof speakBodySchema>;
