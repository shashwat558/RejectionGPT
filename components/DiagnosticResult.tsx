"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { exportDiagnosticToRoadmap } from "@/lib/services/diagnostic.client";
import LoadingButton from "@/components/ui/loading-button";
import ErrorState from "@/components/ui/error-state";
import type { DiagnosticRow } from "@/lib/services/diagnostic.service";

export function SkillBars({ diagnostic }: { diagnostic: DiagnosticRow }) {
  const tracks = diagnostic.scores?.tracks ?? [];
  if (!tracks.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-black mb-4">Your skill map</h2>
      <div className="space-y-4">
        {tracks.map((t) => (
          <div key={t.track}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-black capitalize">{t.track}</span>
              <span className="text-gray-500 font-medium">
                {t.accuracy === null ? `${t.answered} attempted (practice)` : `${Math.round(t.accuracy * 100)}% · ${t.answered} answered`}
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${t.accuracy === null ? "bg-gray-300" : t.accuracy >= 0.7 ? "bg-green-500" : t.accuracy >= 0.5 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${t.accuracy === null ? 100 : Math.round(t.accuracy * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoleFits({ diagnostic }: { diagnostic: DiagnosticRow }) {
  const fits = diagnostic.role_fits ?? [];
  if (!fits.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-black mb-1">Role fits</h2>
      <p className="text-xs text-gray-500 mb-4">Ranked from your baseline. “Stretch” means reachable with focused work on the gaps.</p>
      <div className="space-y-3">
        {fits.map((f) => (
          <div key={f.roleId} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="font-semibold text-black">{f.label}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                f.verdict === "fit" ? "bg-green-50 text-green-700 border border-green-200"
                : f.verdict === "stretch" ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : "bg-gray-100 text-gray-500"
              }`}>
                {f.score === null ? "Need more signal" : `${f.score} · ${f.verdict}`}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{f.blurb}</p>
            {f.caveat && (
              <p className="text-xs text-gray-500 mt-2 flex gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{f.caveat}</p>
            )}
            {f.gaps.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">Gaps to fix: <span className="font-medium text-black">{f.gaps.join(", ")}</span></p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudyPlanView({ diagnostic }: { diagnostic: DiagnosticRow }) {
  const plan = diagnostic.plan;
  if (!plan) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-black mb-1">Your {plan.horizonWeeks}-week plan → {plan.targetRole}</h2>
      <p className="text-xs text-gray-500 mb-4">45–60 minutes a day. Early phases fix gaps; later phases convert to interviews.</p>
      <div className="space-y-5">
        {plan.phases.map((p, i) => (
          <div key={i} className="border-l-2 border-black pl-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-black">{p.title}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{p.weeks}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{p.focus}</p>
            <ul className="mt-2 space-y-1">
              {p.tasks.map((t, j) => (
                <li key={j} className="text-sm text-black flex gap-2"><CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />{t}</li>
              ))}
            </ul>
            {p.practice.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {p.practice.map((pr, k) => (
                  <Link
                    key={k}
                    href="/practice"
                    className="text-[11px] font-semibold text-black bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full px-2.5 py-1 transition-colors"
                  >
                    Drill: {pr.topic}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoadmapExport({
  diagnosticId,
  analyses,
}: {
  diagnosticId: string;
  analyses: { id: string; jobTitle?: string; company?: string }[];
}) {
  const [analysisId, setAnalysisId] = useState(analyses[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!analyses.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-500">
        Upload a resume + job description first (Home), then export this plan onto that analysis roadmap.
      </div>
    );
  }

  const run = async () => {
    if (!analysisId) return;
    setLoading(true);
    setError(null);
    try {
      const { nodesAdded } = await exportDiagnosticToRoadmap(diagnosticId, analysisId);
      setDone(nodesAdded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setLoading(false);
    }
  };

  if (done !== null) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-sm text-green-900 flex items-center justify-between gap-4 flex-wrap">
        <span className="font-medium">Added {done} study-plan nodes to your roadmap (existing nodes kept).</span>
        <Link href={`/analytics/${analysisId}/roadmap`} className="inline-flex items-center gap-1 font-bold text-black hover:underline">
          Open roadmap <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black text-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold">Send this plan to your roadmap</h2>
      <p className="text-sm text-gray-300 mt-1 mb-4">Appends phased nodes to an existing analysis roadmap — never overwrites.</p>
      <div className="flex gap-3 flex-wrap">
        <select
          value={analysisId}
          onChange={(e) => setAnalysisId(e.target.value)}
          className="flex-1 min-w-52 bg-white text-black text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none"
        >
          {analyses.map((a) => (
            <option key={a.id} value={a.id}>
              {a.jobTitle || "Untitled role"}{a.company ? ` @ ${a.company}` : ""}
            </option>
          ))}
        </select>
        <LoadingButton isLoading={loading} loadingText="Exporting…" onClick={run} className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100">
          Export plan
        </LoadingButton>
      </div>
      {error && <div className="mt-3"><ErrorState message={error} /></div>}
    </div>
  );
}
