import type { PracticeTrack } from "@/lib/types/practice";

export const COLLEGE_TIERS = ["tier1", "tier2", "tier3", "other"] as const;
export type CollegeTier = (typeof COLLEGE_TIERS)[number];

export interface RoleProfile {
  id: string;
  label: string;
  blurb: string;
  /** Weight per track; must sum to 1. */
  weights: Record<PracticeTrack, number>;
  /** Honest caveat shown with the fit (e.g. experienced-skewed market). */
  caveat?: string;
  /** Minimum bar: fits below this score are reported as "stretch". */
  bar: number;
}

/**
 * 8 role families (§6.1/C1: students only know "software developer").
 * Weights encode what each family actually screens for at entry level.
 */
export const ROLE_PROFILES: RoleProfile[] = [
  {
    id: "software-dev",
    label: "Software Developer",
    blurb: "Product & services engineering. DSA + CS fundamentals carry the most weight.",
    weights: { aptitude: 0.2, cs: 0.3, dsa: 0.5 },
    bar: 55,
  },
  {
    id: "qa-test",
    label: "QA / Test Engineer",
    blurb: "A wide entry door: aptitude + OS/networking basics + systematic thinking.",
    weights: { aptitude: 0.45, cs: 0.35, dsa: 0.2 },
    bar: 50,
  },
  {
    id: "data-analyst",
    label: "Data Analyst",
    blurb: "SQL-first: aptitude reasoning plus DBMS depth. Start here before data science.",
    weights: { aptitude: 0.45, cs: 0.4, dsa: 0.15 },
    bar: 50,
  },
  {
    id: "devops-cloud",
    label: "DevOps / Cloud",
    blurb: "OS + networks + Linux comfort. Often overlooked by freshers, less crowded.",
    weights: { aptitude: 0.3, cs: 0.55, dsa: 0.15 },
    bar: 50,
  },
  {
    id: "support-eng",
    label: "Support / SRE-adjacent Engineering",
    blurb: "Debugging under pressure: OS/networks plus clear communication.",
    weights: { aptitude: 0.35, cs: 0.5, dsa: 0.15 },
    bar: 45,
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity Analyst",
    blurb: "Networks + OS depth first; tools come later. Growing fresher band.",
    weights: { aptitude: 0.3, cs: 0.55, dsa: 0.15 },
    bar: 50,
  },
  {
    id: "product-analyst",
    label: "Product / Business Analyst",
    blurb: "Structured reasoning + communication over code. Aptitude-heavy funnel.",
    weights: { aptitude: 0.6, cs: 0.25, dsa: 0.15 },
    bar: 50,
  },
  {
    id: "ai-ml",
    label: "AI/ML Engineer",
    blurb: "Real but narrow for freshers: hiring skews experienced, so treat as a second target.",
    weights: { aptitude: 0.25, cs: 0.35, dsa: 0.4 },
    caveat: "AI/ML postings skew toward 8+ years' experience — pair this with a primary target above.",
    bar: 65,
  },
];

export interface TrackAccuracy {
  track: PracticeTrack;
  accuracy: number | null;
  answered: number;
}

export interface RoleFit {
  roleId: string;
  label: string;
  blurb: string;
  /** 0-100 weighted score, null when too little signal. */
  score: number | null;
  verdict: "fit" | "stretch" | "unknown";
  caveat?: string;
  /** Topics under 50% in the role's heavily-weighted tracks. */
  gaps: string[];
}

/**
 * Pure deterministic role-fit. Missing tracks reduce confidence, never
 * silently inflate: score is null until at least 2 tracks have signal.
 */
export function computeRoleFits(
  accuracies: TrackAccuracy[],
  topicAccuracy: { track: PracticeTrack; topic: string; accuracy: number | null }[]
): RoleFit[] {
  const acc = new Map<PracticeTrack, number | null>(accuracies.map((a) => [a.track, a.accuracy]));
  return ROLE_PROFILES.map((p) => {
    const signaled = (Object.keys(p.weights) as PracticeTrack[]).filter(
      (t) => acc.get(t) !== null && acc.get(t) !== undefined
    );
    if (signaled.length < 2) {
      return { roleId: p.id, label: p.label, blurb: p.blurb, score: null, verdict: "unknown" as const, caveat: p.caveat, gaps: [] };
    }
    const wSum = signaled.reduce((s, t) => s + p.weights[t], 0);
    const score = Math.round(
      signaled.reduce((s, t) => s + (acc.get(t) ?? 0) * 100 * p.weights[t], 0) / wSum
    );
    const heavy = (Object.keys(p.weights) as PracticeTrack[]).filter((t) => p.weights[t] >= 0.3);
    const gaps = topicAccuracy
      .filter((t) => heavy.includes(t.track) && t.accuracy !== null && t.accuracy < 0.5)
      .map((t) => t.topic);
    return {
      roleId: p.id,
      label: p.label,
      blurb: p.blurb,
      score,
      verdict: score >= p.bar ? ("fit" as const) : ("stretch" as const),
      caveat: p.caveat,
      gaps,
    };
  }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
}

export interface StudyPhase {
  title: string;
  weeks: string;
  focus: string;
  tasks: string[];
  practice: { track: PracticeTrack; topic: string }[];
}

export interface StudyPlan {
  targetRole: string;
  horizonWeeks: number;
  phases: StudyPhase[];
}
