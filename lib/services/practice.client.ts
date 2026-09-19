import type { AttemptFeedback, PracticeSetDetail, TopicStat } from "@/lib/types/practice";
import type { PracticeDifficulty, PracticeTrack } from "@/lib/types/practice";

function envelope<T>(json: unknown): T {
  const j = json as { data?: T } | null;
  if (!j || typeof j !== "object" || !("data" in j)) throw new Error("Bad response envelope");
  return (j as { data: T }).data;
}

export async function generatePracticeSet(opts: {
  track: PracticeTrack;
  topic: string;
  difficulty: PracticeDifficulty;
  count?: number;
  analysisId?: string;
}): Promise<{ setId: string; questionCount: number }> {
  const res = await fetch("/api/practice/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const j = json as { error?: string } | null;
    throw new Error(j?.error || "Failed to generate practice set");
  }
  return envelope<{ setId: string; questionCount: number }>(json);
}

export async function fetchPracticeSets(): Promise<{
  sets: { id: string; track: PracticeTrack; topic: string; difficulty: PracticeDifficulty; questionCount: number; createdAt: string }[];
  stats: TopicStat[];
}> {
  const res = await fetch("/api/practice/sets");
  if (!res.ok) throw new Error("Failed to load practice sets");
  const json = await res.json().catch(() => null);
  return envelope(json);
}

export async function submitPracticeAttempt(opts: {
  questionId: string;
  selectedIndex?: number | null;
  answerText?: string;
  timeSpent: number;
}): Promise<AttemptFeedback> {
  const res = await fetch("/api/practice/attempt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const j = json as { error?: string } | null;
    throw new Error(j?.error || "Failed to submit attempt");
  }
  return envelope<AttemptFeedback>(json);
}

export type { PracticeSetDetail };
