"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { startDiagnostic } from "@/lib/services/diagnostic.client";
import type { CollegeTier } from "@/lib/types/diagnostic";
import LoadingButton from "@/components/ui/loading-button";
import ErrorState from "@/components/ui/error-state";

const TIERS: { id: CollegeTier; label: string; desc: string }[] = [
  { id: "tier1", label: "Tier 1", desc: "IITs, NITs, top institutes with strong placements" },
  { id: "tier2", label: "Tier 2", desc: "Good private/state colleges with campus recruiters" },
  { id: "tier3", label: "Tier 3", desc: "Colleges with limited campus hiring — off-campus focus" },
  { id: "other", label: "Other", desc: "Polytechnic, ITI, self-taught, career switcher" },
];

export default function DiagnosticIntake() {
  const router = useRouter();
  const [tier, setTier] = useState<CollegeTier>("tier2");
  const [monthsLeft, setMonthsLeft] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setLoading(true);
    setError(null);
    try {
      const { diagnosticId } = await startDiagnostic({ tier, monthsLeft });
      router.push(`/practice/diagnostic/${diagnosticId}/run`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start diagnostic");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <Link href="/practice" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
        <ArrowLeft className="w-4 h-4" /> All practice
      </Link>

      <div className="bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
        <h1 className="text-2xl font-bold text-black tracking-tight">Baseline diagnostic</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          13 questions across aptitude, CS fundamentals, and DSA — about 15 minutes.
          You get a skill map, ranked role fits, and a study plan sized to your timeline.
        </p>

        <div className="mt-6">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Your college background</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTier(t.id)}
                className={`text-left rounded-xl border-2 p-4 transition-all ${
                  tier === t.id ? "border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="font-semibold text-black text-sm">{t.label}</div>
                <div className="text-xs text-gray-500 mt-1 leading-relaxed">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Time until placements / job hunt: {monthsLeft} month{monthsLeft === 1 ? "" : "s"}
          </span>
          <input
            type="range"
            min={1}
            max={12}
            value={monthsLeft}
            onChange={(e) => setMonthsLeft(Number(e.target.value))}
            className="w-full mt-3 accent-black"
          />
          <div className="flex justify-between text-xs text-gray-400 font-medium">
            <span>1 mo (crash)</span>
            <span>6 mo</span>
            <span>12 mo</span>
          </div>
        </div>

        {error && (
          <div className="mt-4">
            <ErrorState message={error} />
          </div>
        )}

        <LoadingButton
          isLoading={loading}
          loadingText="Building your sets… (takes ~30s)"
          onClick={start}
          className="w-full mt-6 py-3 px-8 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center"
        >
          Start diagnostic
        </LoadingButton>
      </div>
    </div>
  );
}
