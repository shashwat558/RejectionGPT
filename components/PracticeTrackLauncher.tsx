"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Code2, Calculator, Play } from "lucide-react";
import { generatePracticeSet } from "@/lib/services/practice.client";
import { topicsForTrack } from "@/lib/types/practice";
import type { PracticeDifficulty, PracticeTrack, TopicStat } from "@/lib/types/practice";
import LoadingButton from "@/components/ui/loading-button";
import ErrorState from "@/components/ui/error-state";

const TRACKS: { id: PracticeTrack; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: "aptitude",
    title: "Aptitude Drills",
    desc: "Timed quant, logic & verbal sets — the mass-recruiter first filter.",
    icon: <Calculator className="w-5 h-5" />,
  },
  {
    id: "dsa",
    title: "DSA by Pattern",
    desc: "Attempt-first problems. Editorial unlocks after your approach.",
    icon: <Code2 className="w-5 h-5" />,
  },
  {
    id: "cs",
    title: "CS Fundamentals",
    desc: "DBMS, OS, networks, OOP — timed quizzes with explanations.",
    icon: <Brain className="w-5 h-5" />,
  },
];

export default function PracticeTrackLauncher({ stats }: { stats: TopicStat[] }) {
  const router = useRouter();
  const [track, setTrack] = useState<PracticeTrack>("aptitude");
  const [topic, setTopic] = useState<string>(topicsForTrack("aptitude")[0]);
  const [difficulty, setDifficulty] = useState<PracticeDifficulty>("medium");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickTrack = (t: PracticeTrack) => {
    setTrack(t);
    setTopic(topicsForTrack(t)[0]);
  };

  const start = async () => {
    setLoading(true);
    setError(null);
    try {
      const { setId } = await generatePracticeSet({ track, topic, difficulty, count });
      router.push(`/practice/session/${setId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate set");
      setLoading(false);
    }
  };

  const statFor = (t: PracticeTrack, top: string) =>
    stats.find((s) => s.track === t && s.topic === top);

  return (
    <div className="bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 mb-10">
      <h2 className="text-xl font-bold text-black tracking-tight">Skill tracks</h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">Timed drills with instant feedback. Weak topics feed your roadmap.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => pickTrack(t.id)}
            className={`text-left rounded-xl border-2 p-4 transition-all ${
              track === t.id
                ? "border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : "border-gray-200 bg-white hover:border-gray-400"
            }`}
          >
            <div className="flex items-center gap-2 text-black font-semibold mb-1">
              {t.icon} {t.title}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Topic</span>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 w-full border-2 border-black rounded-lg px-3 py-2.5 text-sm font-medium text-black bg-white focus:outline-none"
          >
            {topicsForTrack(track).map((t) => {
              const st = statFor(track, t);
              return (
                <option key={t} value={t}>
                  {t}{st && st.accuracy !== null ? ` — ${Math.round(st.accuracy * 100)}%` : ""}
                </option>
              );
            })}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Difficulty</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as PracticeDifficulty)}
            className="mt-1 w-full border-2 border-black rounded-lg px-3 py-2.5 text-sm font-medium text-black bg-white focus:outline-none"
          >
            <option value="easy">Easy — fundamentals</option>
            <option value="medium">Medium — placement level</option>
            <option value="hard">Hard — product screening</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Questions</span>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-1 w-full border-2 border-black rounded-lg px-3 py-2.5 text-sm font-medium text-black bg-white focus:outline-none"
          >
            <option value={5}>5 questions</option>
            <option value={10}>10 questions</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <LoadingButton
        isLoading={loading}
        loadingText="Generating your set…"
        onClick={start}
        className="w-full sm:w-auto py-3 px-8 bg-black text-white font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4" /> Start {track === "dsa" ? "untimed" : "timed"} set{track === "dsa" ? "" : " · 60s/question"}
      </LoadingButton>
    </div>
  );
}
