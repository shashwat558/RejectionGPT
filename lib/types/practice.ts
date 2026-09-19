export const PRACTICE_TRACKS = ["aptitude", "cs", "dsa"] as const;
export type PracticeTrack = (typeof PRACTICE_TRACKS)[number];

export const PRACTICE_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type PracticeDifficulty = (typeof PRACTICE_DIFFICULTIES)[number];

/** Mass-recruiter first filter + general reasoning. Timed 60s/question. */
export const APTITUDE_TOPICS = [
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Data Interpretation",
  "Puzzles & Series",
] as const;

/** Core CS subjects interviews test (§6.1/§7). Timed 60s/question. */
export const CS_TOPICS = [
  "DBMS & SQL",
  "Operating Systems",
  "Computer Networks",
  "OOP",
] as const;

/** Pattern drills — depth beats volume. Untimed approach, then editorial. */
export const DSA_PATTERNS = [
  "Arrays",
  "Hashing",
  "Two Pointers",
  "Sliding Window",
  "Trees",
  "Graphs",
  "DP Basics",
] as const;

export function topicsForTrack(track: PracticeTrack): readonly string[] {
  if (track === "aptitude") return APTITUDE_TOPICS;
  if (track === "cs") return CS_TOPICS;
  return DSA_PATTERNS;
}

/** Per-question time budget in seconds. DSA is untimed (approach-first). */
export function timeLimitForTrack(track: PracticeTrack): number | null {
  return track === "dsa" ? null : 60;
}

export interface PracticeQuestionPublic {
  id: string;
  idx: number;
  track: PracticeTrack;
  topic: string;
  difficulty: PracticeDifficulty;
  prompt: string;
  /** MCQ options (aptitude/cs). Null for DSA approach questions. */
  options: string[] | null;
  /** DSA hints (shown pre-attempt). Null for MCQ. */
  hints: string[] | null;
}

export interface PracticeSetDetail {
  id: string;
  track: PracticeTrack;
  topic: string;
  difficulty: PracticeDifficulty;
  createdAt: string;
  questions: PracticeQuestionPublic[];
  /** Latest attempt per question id (client uses it to restore answered state). */
  attempts: Record<string, {
    selectedIndex: number | null;
    correct: boolean | null;
    timeSpent: number;
  }>;
}

export interface AttemptFeedback {
  correct: boolean | null;
  /** MCQ explanation, returned only after the attempt is recorded. */
  explanation?: string | null;
  /** DSA editorial + hints, returned only after an approach is submitted. */
  editorial?: string | null;
  hints?: string[] | null;
}

export interface TopicStat {
  track: PracticeTrack;
  topic: string;
  attempts: number;
  correct: number;
  accuracy: number | null;
}
