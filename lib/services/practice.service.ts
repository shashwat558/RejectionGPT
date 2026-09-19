import { createClientServer } from "@/lib/utils/supabase/server";
import { generatePracticeSetTool } from "@/lib/agents/tools/practice";
import { scoreMcq } from "@/lib/services/practice-scoring";
import { logger } from "@/lib/logger";
import type {
  AttemptFeedback,
  PracticeDifficulty,
  PracticeSetDetail,
  PracticeTrack,
  TopicStat,
} from "@/lib/types/practice";

interface DbSet {
  id: string;
  user_id: string;
  track: PracticeTrack;
  topic: string;
  difficulty: PracticeDifficulty;
  created_at: string;
}

interface DbQuestion {
  id: string;
  set_id: string;
  idx: number;
  track: PracticeTrack;
  topic: string;
  difficulty: string;
  prompt: string;
  options: string[] | null;
  correct_index: number | null;
  explanation: string | null;
  editorial: string | null;
  hints: string[] | null;
}

async function getOwnedSet(supabase: Awaited<ReturnType<typeof createClientServer>>, setId: string, userId: string) {
  const { data, error } = await supabase.from("practice_sets").select("*").eq("id", setId).single();
  if (error || !data) throw new Error("Practice set not found");
  if ((data as DbSet).user_id !== userId) throw new Error("Forbidden: not your practice set");
  return data as DbSet;
}

async function getOwnedQuestion(
  supabase: Awaited<ReturnType<typeof createClientServer>>,
  questionId: string,
  userId: string
): Promise<{ question: DbQuestion; set: DbSet }> {
  const { data: question, error: qError } = await supabase
    .from("practice_questions")
    .select("*")
    .eq("id", questionId)
    .single();
  if (qError || !question) throw new Error("Practice question not found");
  const set = await getOwnedSet(supabase, (question as DbQuestion).set_id, userId);
  return { question: question as DbQuestion, set };
}

export async function createPracticeSet({
  userId,
  track,
  topic,
  difficulty,
  count = 5,
  analysisId,
  requestId = "unknown",
}: {
  userId: string;
  track: PracticeTrack;
  topic: string;
  difficulty: PracticeDifficulty;
  count?: number;
  analysisId?: string;
  requestId?: string;
}): Promise<{ setId: string; questionCount: number }> {
  const parsed = await generatePracticeSetTool.execute(
    { track, topic: topic.slice(0, 100), difficulty, count },
    { userId, requestId, role: "practice" }
  );

  const supabase = await createClientServer();
  const { data: set, error: setError } = await supabase
    .from("practice_sets")
    .insert({
      user_id: userId,
      track,
      topic: parsed.topic,
      difficulty,
      analysis_id: analysisId ?? null,
      question_count: parsed.mcq.length + parsed.dsa.length,
    })
    .select("id")
    .single();
  if (setError || !set) {
    logger.error("[practice] set insert failed", { requestId, error: setError?.message });
    throw new Error("Failed to save practice set");
  }

  const rows = [
    ...parsed.mcq.map((q, i) => ({
      set_id: (set as { id: string }).id,
      idx: i,
      track,
      topic: parsed.topic,
      difficulty,
      prompt: q.prompt.slice(0, 5000),
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation.slice(0, 5000),
    })),
    ...parsed.dsa.map((q, i) => ({
      set_id: (set as { id: string }).id,
      idx: parsed.mcq.length + i,
      track,
      topic: parsed.topic,
      difficulty,
      prompt: `${q.title}\n\n${q.prompt}`.slice(0, 8000),
      editorial: q.editorial.slice(0, 8000),
      hints: q.hints ?? [],
    })),
  ];
  const { error: qError } = await supabase.from("practice_questions").insert(rows);
  if (qError) {
    logger.error("[practice] questions insert failed", { requestId, error: qError.message });
    await supabase.from("practice_sets").delete().eq("id", (set as { id: string }).id);
    throw new Error("Failed to save practice questions");
  }

  logger.info("[practice] set created", { requestId, setId: (set as { id: string }).id, track, topic });
  return { setId: (set as { id: string }).id, questionCount: rows.length };
}

export async function listPracticeSets(userId: string) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("practice_sets")
    .select("id, track, topic, difficulty, question_count, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return (data ?? []).map((s) => ({
    id: s.id as string,
    track: s.track as PracticeTrack,
    topic: s.topic as string,
    difficulty: s.difficulty as PracticeDifficulty,
    questionCount: s.question_count as number,
    createdAt: s.created_at as string,
  }));
}

/**
 * Set detail with server-only fields scrubbed. Explanations/editorials are
 * NEVER included — they are returned only as feedback for recorded attempts.
 */
export async function getPracticeSetDetail(userId: string, setId: string): Promise<PracticeSetDetail> {
  const supabase = await createClientServer();
  const set = await getOwnedSet(supabase, setId, userId);
  const { data: questions, error: qError } = await supabase
    .from("practice_questions")
    .select("id, idx, track, topic, difficulty, prompt, options, hints")
    .eq("set_id", setId)
    .order("idx", { ascending: true });
  if (qError) throw new Error(qError.message);

  const qIds = (questions ?? []).map((q) => q.id as string);
  const attempts: PracticeSetDetail["attempts"] = {};
  if (qIds.length) {
    const { data: rows } = await supabase
      .from("practice_attempts")
      .select("question_id, selected_index, correct, time_spent, created_at")
      .eq("user_id", userId)
      .in("question_id", qIds)
      .order("created_at", { ascending: false });
    for (const r of rows ?? []) {
      const qid = r.question_id as string;
      if (!attempts[qid]) {
        attempts[qid] = {
          selectedIndex: (r.selected_index as number | null) ?? null,
          correct: (r.correct as boolean | null) ?? null,
          timeSpent: (r.time_spent as number) ?? 0,
        };
      }
    }
  }

  return {
    id: set.id,
    track: set.track,
    topic: set.topic,
    difficulty: set.difficulty,
    createdAt: set.created_at,
    questions: (questions ?? []).map((q) => ({
      id: q.id as string,
      idx: q.idx as number,
      track: q.track as PracticeTrack,
      topic: q.topic as string,
      difficulty: q.difficulty as PracticeDifficulty,
      prompt: q.prompt as string,
      options: (q.options as string[] | null) ?? null,
      hints: (q.hints as string[] | null) ?? null,
    })),
    attempts,
  };
}

export async function submitPracticeAttempt({
  userId,
  questionId,
  selectedIndex,
  answerText,
  timeSpent,
  requestId = "unknown",
}: {
  userId: string;
  questionId: string;
  selectedIndex?: number | null;
  answerText?: string;
  timeSpent: number;
  requestId?: string;
}): Promise<AttemptFeedback> {
  const supabase = await createClientServer();
  const { question, set } = await getOwnedQuestion(supabase, questionId, userId);

  if (question.track === "dsa") {
    const approach = (answerText || "").trim().slice(0, 10000);
    if (!approach) throw new Error("Write your approach before revealing the editorial");
    const { error } = await supabase.from("practice_attempts").insert({
      user_id: userId,
      set_id: set.id,
      question_id: question.id,
      answer_text: approach,
      correct: null,
      time_spent: Math.min(Math.max(Math.floor(timeSpent), 0), 3600),
    });
    if (error) throw new Error(error.message);
    logger.info("[practice] dsa attempt", { requestId, questionId });
    return { correct: null, editorial: question.editorial, hints: question.hints };
  }

  // MCQ: deterministic scoring, explanation returned only after recording.
  const selected = Number.isInteger(selectedIndex) ? (selectedIndex as number) : null;
  if (selected === null || selected < 0 || selected > 3) {
    // Timeout/skip still records an attempt so accuracy reflects it.
  }
  const correct = question.correct_index === null ? false : scoreMcq(selected, question.correct_index);
  const { error } = await supabase.from("practice_attempts").insert({
    user_id: userId,
    set_id: set.id,
    question_id: question.id,
    selected_index: selected,
    correct,
    time_spent: Math.min(Math.max(Math.floor(timeSpent), 0), 3600),
  });
  if (error) throw new Error(error.message);
  logger.info("[practice] mcq attempt", { requestId, questionId, correct });
  return { correct, explanation: question.explanation };
}

export async function getPracticeStats(userId: string): Promise<TopicStat[]> {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("practice_attempts")
    .select("correct, question_id, practice_questions!inner(track, topic)")
    .eq("user_id", userId)
    .not("correct", "is", null)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);

  // Latest attempt per question only (re-tries replace old signal).
  const seen = new Set<string>();
  const byKey = new Map<string, { attempts: number; correct: number }>();
  for (const r of data ?? []) {
    const qid = r.question_id as string;
    if (seen.has(qid)) continue;
    seen.add(qid);
    const q = r.practice_questions as unknown as { track: PracticeTrack; topic: string };
    const key = `${q.track}\n${q.topic}`;
    const agg = byKey.get(key) ?? { attempts: 0, correct: 0 };
    agg.attempts += 1;
    if (r.correct) agg.correct += 1;
    byKey.set(key, agg);
  }
  return [...byKey.entries()].map(([key, v]) => {
    const [track, topic] = key.split("\n") as [PracticeTrack, string];
    return { track, topic, attempts: v.attempts, correct: v.correct, accuracy: v.attempts ? v.correct / v.attempts : null };
  });
}
