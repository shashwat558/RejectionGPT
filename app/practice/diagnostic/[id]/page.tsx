import { createClientServer } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";
import { getDiagnostic } from "@/lib/services/diagnostic.service";
import { getAllFeedbacks } from "@/lib/actions/actions";
import { SkillBars, RoleFits, StudyPlanView, RoadmapExport } from "@/components/DiagnosticResult";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClientServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  let diagnostic;
  try {
    diagnostic = await getDiagnostic(data.user.id, id);
  } catch {
    redirect("/practice");
  }
  if (diagnostic.status !== "completed" || !diagnostic.plan) {
    redirect(`/practice/diagnostic/${id}/run`);
  }
  const analyses = await getAllFeedbacks().catch(() => []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="mx-auto w-full max-w-3xl p-6 pt-24 min-h-screen space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">Your baseline</h1>
          <p className="text-sm text-gray-500 mt-1">Diagnostic complete — here is where you stand and what to do next.</p>
        </div>
        <SkillBars diagnostic={diagnostic} />
        <RoleFits diagnostic={diagnostic} />
        <StudyPlanView diagnostic={diagnostic} />
        <RoadmapExport
          diagnosticId={id}
          analyses={analyses.map((a) => ({ id: a.id, jobTitle: a.jobTitle, company: a.company }))}
        />
      </main>
    </div>
  );
}
