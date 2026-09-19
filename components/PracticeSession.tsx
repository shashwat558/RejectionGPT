"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, RotateCcw, XCircle } from "lucide-react";
import { submitPracticeAttempt } from "@/lib/services/practice.client";
import { timeLimitForTrack } from "@/lib/types/practice";
import type { AttemptFeedback, PracticeSetDetail } from "@/lib/types/practice";

export default function PracticeSession({ detail }: { detail: PracticeSetDetail }) {
  const router = useRouter();
  const questions = detail.questions;
  const timeLimit = timeLimitForTrack(detail.track);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [approach, setApproach] = useState("");
  const [feedback, setFeedback] = useState<Record<string, AttemptFeedback>>({});
  const [picks, setPicks] = useState<Record<string, number | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(timeLimit);
  const [finished, setFinished] = useState(false);

  const elapsedRef = useRef<Record<string, number>>({});
  const current = questions[index];

  // Per-question timer for MCQ tracks. Navigating pauses; elapsed accumulates.
  useEffect(() => {
    if (!current || timeLimit === null || feedback[current.id] || finished) return;
    setTimeLeft(timeLimit - (elapsedRef.current[current.id] ?? 0));
    const id = window.setInterval(() => {
      elapsedRef.current[current.id] = (elapsedRef.current[current.id] ?? 0) + 1;
      const remaining = timeLimit - elapsedRef.current[current.id];
      setTimeLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        void submit(null, true);
      }
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, finished]);

  // Reset inputs when moving between questions.
  useEffect(() => {
    setSelected(null);
    setApproach("");
    setError(null);
    if (current && timeLimit !== null) setTimeLeft(timeLimit - (elapsedRef.current[current.id] ?? 0));
  }, [current?.id, timeLimit]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (pick: number | null, isTimeout = false) => {
    if (!current || submitting || feedback[current.id]) return;
    if (current.options && pick === null && !isTimeout) return;
    if (!current.options && !approach.trim()) {
      setError("Write your approach first — the editorial unlocks after you attempt.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const fb = await submitPracticeAttempt({
        questionId: current.id,
        selectedIndex: current.options ? pick : undefined,
        answerText: current.options ? undefined : approach.trim(),
        timeSpent: elapsedRef.current[current.id] ?? 0,
      });
      setFeedback((prev) => ({ ...prev, [current.id]: fb }));
      if (current.options) setPicks((prev) => ({ ...prev, [current.id]: pick }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (index < questions.length - 1) setIndex((i) => i + 1);
    else setFinished(true);
  };

  const summary = useMemo(() => {
    let correct = 0;
    let answeredCount = 0;
    for (const q of questions) {
      const fb = feedback[q.id];
      if (fb) {
        if (fb.correct !== null) {
          answeredCount += 1;
          if (fb.correct) correct += 1;
        } else {
          answeredCount += 1; // DSA approach submitted
        }
      } else if (detail.attempts[q.id]) {
        answeredCount += 1;
        if (detail.attempts[q.id].correct) correct += 1;
      }
    }
    const mcqTotal = questions.filter((q) => q.options).length;
    const mcqCorrect = questions.filter((q) => q.options && (feedback[q.id]?.correct || detail.attempts[q.id]?.correct)).length;
    return { correct, answeredCount, mcqTotal, mcqCorrect };
  }, [feedback, questions, detail.attempts]);

  if (!current) {
    return <p className="py-16 text-center text-gray-500">This set has no questions.</p>;
  }

  if (finished) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black mb-2">Set complete!</h1>
          <p className="text-gray-500">
            {detail.track === "dsa"
              ? `${summary.answeredCount}/${questions.length} approaches submitted`
              : `${summary.mcqCorrect}/${summary.mcqTotal} correct (${summary.mcqTotal ? Math.round((summary.mcqCorrect / summary.mcqTotal) * 100) : 0}%)`}
            {" · "}{detail.topic}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          {questions.map((q, i) => {
            const fb = feedback[q.id];
            const prev = detail.attempts[q.id];
            const ok = fb?.correct ?? prev?.correct ?? null;
            return (
              <div key={q.id} className="flex items-start gap-3 border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center mt-0.5 ${ok === true ? "bg-green-100 text-green-600" : ok === false ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-500"}`}>
                  {ok === true ? <CheckCircle className="w-4 h-4" /> : ok === false ? <XCircle className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black line-clamp-2">{q.prompt.split("\n")[0]}</p>
                  {q.options && (() => {
                    const pickIdx = picks[q.id] ?? detail.attempts[q.id]?.selectedIndex ?? null;
                    return (
                      <p className="text-xs text-gray-500 mt-1">
                        Your pick: {pickIdx === null || pickIdx === undefined ? "Skipped" : q.options[pickIdx] ?? "—"}
                      </p>
                    );
                  })()}
                </div>
                <button onClick={() => { setFinished(false); setIndex(i); }} className="text-xs font-semibold text-gray-500 hover:text-black shrink-0">
                  Review
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-3">
          <button onClick={() => router.push("/practice")} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-black hover:bg-gray-50 shadow-sm">
            <RotateCcw className="w-4 h-4" /> More practice
          </button>
          <button onClick={() => router.push("/analytics")} className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 shadow-sm">
            Back to Analytics
          </button>
        </div>
      </div>
    );
  }

  const fb = feedback[current.id];
  const isMcq = current.options !== null;
  const effectivePick = selected ?? picks[current.id] ?? detail.attempts[current.id]?.selectedIndex ?? null;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-500">Question {index + 1} of {questions.length}</span>
        {timeLimit !== null && timeLeft !== null && !fb && (
          <span className={`inline-flex items-center gap-1.5 font-mono font-bold ${timeLeft <= 10 ? "text-red-600" : "text-gray-700"}`}>
            <Clock className="w-4 h-4" /> {Math.floor(Math.max(0, timeLeft) / 60)}:{String(Math.max(0, timeLeft) % 60).padStart(2, "0")}
          </span>
        )}
        {timeLimit === null && <span className="text-xs font-medium text-gray-400">Untimed — think first</span>}
      </div>
      <div className="flex gap-1.5">
        {questions.map((q, i) => {
          const state = feedback[q.id]?.correct ?? detail.attempts[q.id]?.correct ?? (feedback[q.id] ? "done" : null);
          return (
            <button
              key={q.id}
              onClick={() => setIndex(i)}
              className={`h-2 flex-1 rounded-full transition-colors ${i === index ? "bg-black" : state === true ? "bg-green-500" : state === false ? "bg-red-400" : state === "done" ? "bg-gray-400" : "bg-gray-200"}`}
              aria-label={`Go to question ${i + 1}`}
            />
          );
        })}
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        {isMcq ? (
          <p className="text-lg font-semibold text-black leading-relaxed whitespace-pre-wrap">{current.prompt}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-800">
            <Markdown remarkPlugins={[remarkGfm]}>{current.prompt}</Markdown>
          </div>
        )}

        {isMcq ? (
          <div className="mt-6 space-y-3">
            {current.options!.map((opt, i) => {
              const revealed = fb !== undefined;
              return (
                <button
                  key={i}
                  disabled={revealed || submitting}
                  onClick={() => setSelected(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    revealed
                      ? getOptionClass(i, effectivePick, fb)
                      : selected === i
                        ? "border-black bg-gray-50 text-black shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  } disabled:cursor-default`}
                >
                  <span className="mr-3 inline-flex w-6 h-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {["A", "B", "C", "D"][i]}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {current.hints && current.hints.length > 0 && !fb && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                <span className="font-bold text-black uppercase tracking-wider text-[11px] block mb-2">Hints</span>
                <ul className="list-disc pl-5 space-y-1">
                  {current.hints.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}
            {!fb ? (
              <textarea
                value={approach}
                onChange={(e) => setApproach(e.target.value.slice(0, 10000))}
                placeholder="Explain your approach first: pattern, steps, complexity… (editorial unlocks after you submit)"
                className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl text-black text-sm placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
              />
            ) : (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                Approach recorded. Compare with the editorial below.
              </div>
            )}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}

        {/* Feedback */}
        {fb && (
          <div className="mt-6 space-y-4 animate-in fade-in">
            {isMcq ? (
              <div className={`rounded-xl border p-4 text-sm leading-relaxed ${fb.correct ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"}`}>
                <span className="font-bold block mb-1">{fb.correct ? "Correct!" : effectivePick === null ? "Time ran out." : "Not quite."}</span>
                {fb.explanation}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <span className="font-bold text-black uppercase tracking-wider text-[11px] block mb-3">Editorial</span>
                <div className="prose prose-sm max-w-none text-gray-800">
                  <Markdown remarkPlugins={[remarkGfm]}>{fb.editorial ?? ""}</Markdown>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-black disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {!fb ? (
            isMcq ? (
              <button
                onClick={() => void submit(selected)}
                disabled={submitting || selected === null}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50 shadow-sm"
              >
                Submit answer
              </button>
            ) : (
              <button
                onClick={() => void submit(null)}
                disabled={submitting || !approach.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50 shadow-sm"
              >
                Submit approach
              </button>
            )
          ) : (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm"
            >
              {index === questions.length - 1 ? "See summary" : "Next"} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getOptionClass(
  i: number,
  effectivePick: number | null,
  fb: AttemptFeedback
): string {
  if (effectivePick === i) {
    return fb.correct
      ? "border-green-500 bg-green-50 text-green-900"
      : "border-red-400 bg-red-50 text-red-900";
  }
  return "border-gray-200 bg-white text-gray-500";
}
