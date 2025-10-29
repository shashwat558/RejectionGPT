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
    <div className="min-h-screen ">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#303030]/20 to-transparent pointer-events-none" />

      <div className="mx-auto w-full max-w-6xl p-6 relative z-10">
        <div className="max-w-5xl w-full mx-auto p-6 md:p-8 rounded-lg border-t-3 border-[#383838] bg-[#252525] shadow-xl">
          <div className="mb-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#333] text-gray-300 text-xs font-medium mb-2">
              
              <span>Tailored DSA Practice</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-200">Practice Questions</h1>
                <p className="mt-2 text-sm text-gray-400">Curated LeetCode problems based on your analysis to target weak areas.</p>
              </div>

              <Link href={`/analytics/${id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Analysis
              </Link>
            </div>
          </div>

          <div className="mt-4">
            <DSASuggestionsPage analysisId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}
