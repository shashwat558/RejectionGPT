import { z } from "zod";
import type { ToolDef } from "@/lib/agents/types";
import { generatePracticeSet, type PracticeDsa, type PracticeMcq } from "@/lib/ai";
import type { PracticeDifficulty, PracticeTrack } from "@/lib/types/practice";

export const practiceSetInput = z.object({
  track: z.enum(["aptitude", "cs", "dsa"]),
  topic: z.string().min(1).max(100),
  difficulty: z.enum(["easy", "medium", "hard"]),
  count: z.number().int().min(1).max(10).optional().default(5),
});

export type PracticeSetInput = z.output<typeof practiceSetInput>;

export interface PracticeSetOutput {
  track: PracticeTrack;
  topic: string;
  difficulty: PracticeDifficulty;
  mcq: PracticeMcq[];
  dsa: PracticeDsa[];
}

/** Pure-LLM tool: generates a practice set. Persistence is owned by practice.service. */
export const generatePracticeSetTool: ToolDef<PracticeSetInput, PracticeSetOutput> = {
  name: "generatePracticeSet",
  description: "Generate a track-based practice question set",
  inputSchema: practiceSetInput,
  async execute(input) {
    const count = input.count;
    const generated = await generatePracticeSet({
      track: input.track,
      topic: input.topic,
      difficulty: input.difficulty,
      count,
    });
    if (input.track === "dsa") {
      return { track: input.track, topic: input.topic, difficulty: input.difficulty, mcq: [], dsa: generated as PracticeDsa[] };
    }
    return { track: input.track, topic: input.topic, difficulty: input.difficulty, mcq: generated as PracticeMcq[], dsa: [] };
  },
};
