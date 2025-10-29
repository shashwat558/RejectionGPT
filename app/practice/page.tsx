import Link from "next/link"
import { createClientServer } from "@/lib/utils/supabase/server"
import { redirect } from "next/navigation"
import { getAllFeedbacks } from "@/lib/actions/actions"

import DSAGenerateButton from "@/components/DSAGenerateButton"

export default async function Page() {
  const supabase = await createClientServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect(`${process.env.SITE_URL}/login`)
  }

  const feedbacks = await getAllFeedbacks();

  const ids = feedbacks.map(f => f.id);
  let withQuestions = new Set<string>();
  if (ids.length > 0) {
    const { data: questionRows } = await supabase
      .from("dsa_questions")
      .select("analysis_result_id")
      .in("analysis_result_id", ids);
    if (Array.isArray(questionRows)) {
      withQuestions = new Set(questionRows.map(r => String(r.analysis_result_id)));
    }
  }

  return (
    <main
      className="mx-auto w-full max-w-6xl p-6 min-h-screen"
    >
      <section className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-300 ">Practice</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate DSA questions tailored to each analysis or jump into practice.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feedbacks.map((fb) => {
          const hasQuestions = withQuestions.has(fb.id);
          return (
            <div key={fb.id} className="bg-[#252525] border border-[#383838] rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="text-gray-200 font-medium truncate max-w-[70%]">{fb.jobTitle || "Untitled Role"}</div>
                <div className="text-xs px-1.5 py-0.5 rounded-full bg-[#333] text-gray-300">{fb.matchScore}</div>
              </div>
              <div className="text-xs text-gray-500 truncate">{fb.company || "Unknown Company"}</div>
              <div className="text-xs text-gray-500">{fb.date}</div>

              <div className="pt-2">
                {hasQuestions ? (
                  <Link
                    href={`/analytics/${fb.id}/practise`}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#333] hover:bg-[#444] text-gray-300 rounded-md text-sm transition-colors"
                  >
                    Go to Practice
                  </Link>
                ) : (
                  <DSAGenerateButton
                    analysisId={fb.id}
                    feedback={{
                      jobTitle: fb.jobTitle,
                      company: fb.company,
                      matchScore: fb.matchScore,
                    
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  )
}
