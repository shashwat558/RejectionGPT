import DSASuggestionsPage from "@/components/dsa-component";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClientServer } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClientServer();
  const { data: analysisData, error: analysisError } = await supabase.from("analysis_result").select("id").eq("id", id).single();
  if(analysisError || !analysisData) {
    redirect("/analytics");
  }
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-white to-transparent pointer-events-none" />

      <div className="mx-auto w-full max-w-6xl p-6 relative z-10">
        <div className="max-w-5xl w-full mx-auto p-6 md:p-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-black text-xs font-bold uppercase tracking-wider mb-4 self-start">
              <span>Tailored DSA Practice</span>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">Practice Questions</h1>
                <p className="mt-2 text-sm md:text-base text-gray-500 font-medium">Curated LeetCode problems based on your analysis to target weak areas.</p>
              </div>

              <Link href={`/analytics/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors bg-white hover:bg-gray-50 border border-transparent hover:border-gray-200 px-4 py-2 rounded-lg">
                <ArrowLeft className="w-4 h-4" />
                Back to Analysis
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <DSASuggestionsPage analysisId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}
