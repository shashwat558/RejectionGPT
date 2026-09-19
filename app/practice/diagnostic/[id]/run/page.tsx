import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClientServer } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";
import { getDiagnosticProgress } from "@/lib/services/diagnostic.service";
import { getPracticeSetDetail } from "@/lib/services/practice.service";
import PracticeSession from "@/components/PracticeSession";
import DiagnosticFinish from "@/components/DiagnosticFinish";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ s?: string }>;
}) {
  const { id } = await params;
  const { s } = await searchParams;
  const supabase = await createClientServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  let progress;
  try {
    progress = await getDiagnosticProgress(data.user.id, id);
  } catch {
    redirect("/practice");
  }
  if (progress.diagnostic.status === "completed") redirect(`/practice/diagnostic/${id}`);

  const idx = Math.max(0, parseInt(s ?? "0", 10) || 0);
  if (idx >= progress.sets.length) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <main className="mx-auto w-full max-w-4xl p-6 pt-24 min-h-screen">
          <DiagnosticFinish diagnosticId={id} />
        </main>
      </div>
    );
  }

  const current = progress.sets[idx];
  let detail;
  try {
    detail = await getPracticeSetDetail(data.user.id, current.setId);
  } catch {
    redirect("/practice");
  }

  const next =
    idx + 1 < progress.sets.length
      ? { href: `/practice/diagnostic/${id}/run?s=${idx + 1}`, label: `Continue: ${progress.sets[idx + 1].track} →` }
      : { href: `/practice/diagnostic/${id}/run?s=${progress.sets.length}`, label: "See my results →" };

  const doneCount = progress.sets.filter((x) => x.answered >= x.total).length;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="mx-auto w-full max-w-4xl p-6 pt-24 min-h-screen">
        <div className="flex items-center justify-between mb-2">
          <Link href="/practice" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Exit diagnostic
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Diagnostic · part {idx + 1} of {progress.sets.length} · {doneCount} done
          </span>
        </div>
        <PracticeSession key={detail.id} detail={detail} finishNext={next} />
      </main>
    </div>
  );
}
