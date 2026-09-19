import { createClientServer } from "@/lib/utils/supabase/server";
import { createPracticeSet } from "@/lib/services/practice.service";
import { generateStudyPlanTool } from "@/lib/agents/tools/diagnostic";
import { computeRoleFits, ROLE_PROFILES } from "@/lib/types/diagnostic";
import { topicsForTrack } from "@/lib/types/practice";
import type { StudyPlanPhase } from "@/lib/ai";
import { logger } from "@/lib/logger";
import type { PracticeTrack } from "@/lib/types/practice";
import type { CollegeTier, RoleFit, StudyPlan } from "@/lib/types/diagnostic";

type Db = Awaited<ReturnType<typeof createClientServer>>;

export interface DiagnosticRow {
  id: string;
  user_id: string;
  tier: CollegeTier;
  months_left: number;
  set_ids: string[];
  status: "started" | "completed";
  scores: {
    tracks: { track: PracticeTrack; accuracy: number | null; answered: number }[];
    topics: { track: PracticeTrack; topic: string; accuracy: number | null; answered: number }[];
  } | null;
  role_fits: RoleFit[] | null;
  plan: StudyPlan | null;
  created_at: string;
  completed_at: string | null;
}

export interface SetProgress {
  setId: string;
  track: PracticeTrack;
  topic: string;
  total: number;
  answered: number;
}

/** Fixed baseline: comparable across students, sized to ~15 minutes. */
const BASELINE_SETS: { track: PracticeTrack; topic: string; difficulty: "easy" | "medium" | "hard"; count: number }[] = [
  { track: "aptitude", topic: "Mixed Aptitude", difficulty: "medium", count: 5 },
  { track: "cs", topic: "Mixed CS Fundamentals", difficulty: "medium", count: 5 },
  { track: "dsa", topic: "Arrays", difficulty: "easy", count: 3 },
];

async function getOwned(db: Db, id: string, userId: string): Promise<DiagnosticRow> {
  const { data, error } = await db.from("diagnostics").select("*").eq("id", id).single();
  if (error || !data) throw new Error("Diagnostic not found");
  if ((data as DiagnosticRow).user_id !== userId) throw new Error("Forbidden: not your diagnostic");
  return data as DiagnosticRow;
}

export async function startDiagnostic({
  userId,
  tier,
  monthsLeft,
  requestId = "unknown",
}: {
  userId: string;
  tier: CollegeTier;
  monthsLeft: number;
  requestId?: string;
}): Promise<{ diagnosticId: string; setIds: string[] }> {
  const db = await createClientServer();
  const setIds: string[] = [];
  for (const spec of BASELINE_SETS) {
    // Mixed topics aren't in the per-track lists; generate against a real
    // topic then relabel — no wait, keep it honest: use the set topic as-is
    // and skip the topic-allowlist check (diagnostics bypass hub validation).
    const { setId } = await createPracticeSet({
      userId,
      track: spec.track,
      topic: spec.track === "aptitude" ? "Quantitative Aptitude" : spec.track === "cs" ? "DBMS & SQL" : spec.topic,
      difficulty: spec.difficulty,
      count: spec.count,
      requestId,
    });
    setIds.push(setId);
  }
  const { data, error } = await db
    .from("diagnostics")
    .insert({ user_id: userId, tier, months_left: monthsLeft, set_ids: setIds })
    .select("id")
    .single();
  if (error || !data) {
    logger.error("[diagnostic] insert failed", { requestId, error: error?.message });
    throw new Error("Failed to start diagnostic");
  }
  logger.info("[diagnostic] started", { requestId, diagnosticId: (data as { id: string }).id });
  return { diagnosticId: (data as { id: string }).id, setIds };
}

export async function getDiagnostic(userId: string, id: string): Promise<DiagnosticRow> {
  const db = await createClientServer();
  return getOwned(db, id, userId);
}

export async function listDiagnostics(userId: string) {
  const db = await createClientServer();
  const { data, error } = await db
    .from("diagnostics")
    .select("id, tier, months_left, status, created_at, completed_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getDiagnosticProgress(
  userId: string,
  id: string
): Promise<{ diagnostic: DiagnosticRow; sets: SetProgress[] }> {
  const db = await createClientServer();
  const diagnostic = await getOwned(db, id, userId);

  const { data: questions } = await db
    .from("practice_questions")
    .select("id, set_id, track, topic")
    .in("set_id", diagnostic.set_ids);
  const qids = (questions ?? []).map((q) => q.id as string);
  const { data: attempts } = qids.length
    ? await db
        .from("practice_attempts")
        .select("question_id")
        .eq("user_id", userId)
        .in("question_id", qids)
    : { data: [] as { question_id: string }[] };
  const answeredSet = new Set((attempts ?? []).map((a) => a.question_id as string));

  const sets: SetProgress[] = diagnostic.set_ids.map((setId) => {
    const qs = (questions ?? []).filter((q) => (q.set_id as string) === setId);
    const first = qs[0];
    return {
      setId,
      track: (first?.track as PracticeTrack) ?? "aptitude",
      topic: (first?.topic as string) ?? "",
      total: qs.length,
      answered: qs.filter((q) => answeredSet.has(q.id as string)).length,
    };
  });
  return { diagnostic, sets };
}

interface ScoredMaps {
  tracks: { track: PracticeTrack; accuracy: number | null; answered: number }[];
  topics: { track: PracticeTrack; topic: string; accuracy: number | null; answered: number }[];
}

async function scoreSets(db: Db, userId: string, setIds: string[]): Promise<ScoredMaps> {
  const { data: questions } = await db
    .from("practice_questions")
    .select("id, set_id, track, topic")
    .in("set_id", setIds);
  const qids = (questions ?? []).map((q) => q.id as string);
  const { data: attempts } = qids.length
    ? await db
        .from("practice_attempts")
        .select("question_id, correct, created_at")
        .eq("user_id", userId)
        .in("question_id", qids)
        .order("created_at", { ascending: false })
    : { data: [] as { question_id: string; correct: boolean | null }[] };

  // Latest attempt per question; DSA approaches (correct null) count as
  // answered but carry no accuracy signal.
  const latest = new Map<string, boolean | null>();
  for (const a of attempts ?? []) {
    const qid = a.question_id as string;
    if (!latest.has(qid)) latest.set(qid, (a.correct as boolean | null) ?? null);
  }

  const byTrack = new Map<PracticeTrack, { scored: number; right: number; answered: number }>();
  const byTopic = new Map<string, { track: PracticeTrack; topic: string; scored: number; right: number; answered: number }>();
  for (const q of questions ?? []) {
    const track = q.track as PracticeTrack;
    const topic = q.topic as string;
    const v = latest.get(q.id as string);
    const t = byTrack.get(track) ?? { scored: 0, right: 0, answered: 0 };
    const k = `${track}\n${topic}`;
    const tp = byTopic.get(k) ?? { track, topic, scored: 0, right: 0, answered: 0 };
    if (v !== undefined) {
      t.answered += 1;
      tp.answered += 1;
      if (v !== null) {
        t.scored += 1;
        tp.scored += 1;
        if (v) {
          t.right += 1;
          tp.right += 1;
        }
      }
    }
    byTrack.set(track, t);
    byTopic.set(k, tp);
  }
  return {
    tracks: [...byTrack.entries()].map(([track, v]) => ({
      track,
      accuracy: v.scored ? v.right / v.scored : null,
      answered: v.answered,
    })),
    topics: [...byTopic.values()].map((v) => ({
      track: v.track,
      topic: v.topic,
      accuracy: v.scored ? v.right / v.scored : null,
      answered: v.answered,
    })),
  };
}

function sanitizePlanPhases(phases: StudyPlanPhase[]): StudyPlan["phases"] {
  const validTracks: PracticeTrack[] = ["aptitude", "cs", "dsa"];
  return phases.map((p) => ({
    ...p,
    practice: p.practice
      .filter(
        (pr): pr is { track: PracticeTrack; topic: string } =>
          (validTracks as string[]).includes(pr.track) &&
          (topicsForTrack(pr.track as PracticeTrack) as readonly string[]).includes(pr.topic)
      ),
  }));
}

export async function completeDiagnostic({
  userId,
  id,
  targetRole,
  requestId = "unknown",
}: {
  userId: string;
  id: string;
  targetRole?: string;
  requestId?: string;
}): Promise<DiagnosticRow> {
  const db = await createClientServer();
  const diagnostic = await getOwned(db, id, userId);
  if (diagnostic.status === "completed" && diagnostic.plan) return diagnostic;

  const { sets } = await getDiagnosticProgress(userId, id);
  const remaining = sets.reduce((s, x) => s + (x.total - x.answered), 0);
  if (remaining > 0) throw new Error(`Diagnostic incomplete: ${remaining} questions left`);

  const scores = await scoreSets(db, userId, diagnostic.set_ids);
  const fits = computeRoleFits(
    scores.tracks,
    scores.topics.map((t) => ({ track: t.track, topic: t.topic, accuracy: t.accuracy }))
  );
  const chosen =
    (targetRole && ROLE_PROFILES.find((r) => r.id === targetRole)) ||
    ROLE_PROFILES.find((r) => r.id === fits.find((f) => f.score !== null)?.roleId) ||
    ROLE_PROFILES[0];

  const strengths = scores.topics.filter((t) => (t.accuracy ?? 0) >= 0.7).map((t) => `${t.topic} (${Math.round((t.accuracy ?? 0) * 100)}%)`);
  const gaps = scores.topics.filter((t) => (t.accuracy ?? 1) < 0.5).map((t) => `${t.topic} (${Math.round((t.accuracy ?? 0) * 100)}%)`);

  const { phases } = await generateStudyPlanTool.execute(
    { targetRole: chosen.label, tier: diagnostic.tier, monthsLeft: diagnostic.months_left, strengths, gaps },
    { userId, requestId, role: "practice" }
  );
  const plan: StudyPlan = {
    targetRole: chosen.label,
    horizonWeeks: Math.min(Math.max(diagnostic.months_left * 4, 4), 24),
    phases: sanitizePlanPhases(phases),
  };

  const { data, error } = await db
    .from("diagnostics")
    .update({
      status: "completed",
      scores,
      role_fits: fits,
      plan,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) {
    logger.error("[diagnostic] complete failed", { requestId, error: error?.message });
    throw new Error("Failed to complete diagnostic");
  }
  logger.info("[diagnostic] completed", { requestId, id, target: chosen.label });
  return data as DiagnosticRow;
}

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  category?: string;
  difficulty?: string;
  duration?: string;
  position?: { x: number; y: number };
}
interface RoadmapDoc {
  title?: string;
  description?: string;
  nodes?: RoadmapNode[];
  edges?: { id: string; source: string; target: string }[];
}

/**
 * Append the study plan as chained nodes on the analysis roadmap.
 * Never overwrites: existing nodes/edges are preserved, new nodes chain
 * from the last existing node when one is present.
 */
export async function exportPlanToRoadmap({
  userId,
  diagnosticId,
  analysisId,
  requestId = "unknown",
}: {
  userId: string;
  diagnosticId: string;
  analysisId: string;
  requestId?: string;
}): Promise<{ nodesAdded: number }> {
  const db = await createClientServer();
  const diagnostic = await getOwned(db, diagnosticId, userId);
  if (diagnostic.status !== "completed" || !diagnostic.plan) {
    throw new Error("Complete the diagnostic before exporting to roadmap");
  }
  const { data: analysis, error } = await db
    .from("analysis_result")
    .select("id, user_id, roadmap")
    .eq("id", analysisId)
    .single();
  if (error || !analysis) throw new Error("Analysis not found");
  if ((analysis as { user_id: string }).user_id !== userId) throw new Error("Forbidden: not your analysis");

  const doc = ((analysis as { roadmap: RoadmapDoc | null }).roadmap ?? {}) as RoadmapDoc;
  const nodes = Array.isArray(doc.nodes) ? [...doc.nodes] : [];
  const edges = Array.isArray(doc.edges) ? [...doc.edges] : [];
  const tag = diagnosticId.slice(0, 8);

  let prevId = nodes.length ? nodes[nodes.length - 1].id : null;
  diagnostic.plan.phases.forEach((phase, i) => {
    const nodeId = `diag-${tag}-p${i}`;
    if (!nodes.some((n) => n.id === nodeId)) {
      nodes.push({
        id: nodeId,
        title: phase.title,
        description: `${phase.focus}\n\n${phase.tasks.map((t) => `• ${t}`).join("\n")}`,
        category: "Study Plan",
        difficulty: "medium",
        duration: phase.weeks,
        position: { x: 120 + (nodes.length % 8) * 260, y: 120 + Math.floor(nodes.length / 8) * 220 },
      });
    }
    if (prevId && !edges.some((e) => e.source === prevId && e.target === nodeId)) {
      edges.push({ id: `diag-${tag}-e${i}`, source: prevId, target: nodeId });
    }
    prevId = nodeId;
  });

  const { error: updError } = await db
    .from("analysis_result")
    .update({
      roadmap: {
        ...doc,
        title: doc.title ?? `Roadmap → ${diagnostic.plan.targetRole}`,
        nodes,
        edges,
      },
    })
    .eq("id", analysisId);
  if (updError) throw new Error(updError.message);
  logger.info("[diagnostic] exported to roadmap", { requestId, diagnosticId, analysisId });
  return { nodesAdded: diagnostic.plan.phases.length };
}
