import DSASuggestionsPage, { AnalysisFeedback } from "@/components/dsa-component";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { createClientServer } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClientServer();
  const { data: analysisData, error: analysisError } = await supabase.from("analysis_result").select("*").eq("id", id).single();
  if(analysisError || !analysisData) {
    redirect("/analytics");
  }
  return (
    <main
      className="mx-auto w-full max-w-6xl p-6 min-h-screen"
    
    >
      <section className="mb-6 relative">
        <div className="absolute -top-6 left-0 w-full h-32 bg-gradient-to-b from-[#2b2b2b]/30 to-transparent pointer-events-none rounded-t-xl" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-gray-200">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Practice Questions
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Curated LeetCode problems based on your analysis to target weak areas.
            </p>
          </div>

          <Link href={`/analytics/${id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </Link>
        </div>
      </section>
       <DSASuggestionsPage analysisId={id} feedback={analysisData as AnalysisFeedback} />
    </main>
  )
}
