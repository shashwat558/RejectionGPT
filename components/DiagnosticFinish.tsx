"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { completeDiagnostic } from "@/lib/services/diagnostic.client";
import ErrorState from "@/components/ui/error-state";

export default function DiagnosticFinish({ diagnosticId }: { diagnosticId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    completeDiagnostic(diagnosticId)
      .then(() => router.push(`/practice/diagnostic/${diagnosticId}`))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to build your results"));
  }, [diagnosticId, router]);

  const retry = () => {
    started.current = false;
    setError(null);
    completeDiagnostic(diagnosticId)
      .then(() => router.push(`/practice/diagnostic/${diagnosticId}`))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to build your results"));
  };

  return (
    <div className="max-w-xl mx-auto py-20 text-center space-y-6">
      {!error ? (
        <>
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />
          <h1 className="text-2xl font-bold text-black tracking-tight">Analyzing your baseline…</h1>
          <p className="text-sm text-gray-500">Scoring your sets, ranking role fits, and building your study plan. Takes ~20 seconds.</p>
        </>
      ) : (
        <>
          <ErrorState message={error} />
          <button onClick={retry} className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800">
            Retry
          </button>
        </>
      )}
    </div>
  );
}
