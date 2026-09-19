import Link from "next/link"
import { createClientServer } from "@/lib/utils/supabase/server"
import { redirect } from "next/navigation"
import { getAllFeedbacks } from "@/lib/actions/actions"
import { getPracticeStats } from "@/lib/services/practice.service"
import DSAGenerateButton from "@/components/DSAGenerateButton"
import PracticeTrackLauncher from "@/components/PracticeTrackLauncher"
import { Briefcase, Calendar } from "lucide-react"

export default async function Page() {
  const supabase = await createClientServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect(`${process.env.SITE_URL}/login`)
  }

  const feedbacks = await getAllFeedbacks();
  const stats = await getPracticeStats(data.user.id).catch(() => []);

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
    <div className="min-h-screen bg-gray-50/30">
      <main className="mx-auto w-full max-w-6xl p-6 pt-24 min-h-screen">
        <section className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl text-black font-bold tracking-tight">Practice Questions</h1>
          <p className="mt-3 text-gray-500 max-w-2xl">
            Generate DSA questions tailored to your resume analysis or jump directly into practicing.
          </p>
        </section>

        <PracticeTrackLauncher stats={stats} />

        <Link
          href="/practice/diagnostic/new"
          className="block bg-black text-white rounded-2xl p-6 md:p-8 mb-10 shadow-sm hover:bg-gray-900 transition-colors"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Not sure where you stand? Take the baseline diagnostic</h2>
              <p className="text-sm text-gray-300 mt-1 max-w-2xl">
                15 minutes across aptitude, CS fundamentals, and DSA → skill map, role fits, and a study plan sized to your timeline.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-sm font-bold shrink-0">
              Start diagnostic
            </span>
          </div>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {feedbacks.map((fb) => {
            const hasQuestions = withQuestions.has(fb.id);
            return (
              <div key={fb.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between group">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-black font-semibold truncate max-w-[70%]">{fb.jobTitle || "Untitled Role"}</h3>
                    <div className="text-xs px-2 py-1 rounded-md font-bold bg-gray-100 text-gray-900">{fb.matchScore}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-600">
                       <Briefcase className="w-4 h-4 mr-2" />
                       <span className="truncate">{fb.company || "Unknown Company"}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                       <Calendar className="w-3.5 h-3.5 mr-2" />
                       {fb.date}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 w-full mt-auto">
                  {hasQuestions ? (
                    <Link
                      href={`/analytics/${fb.id}/practise`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
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
    </div>
  )
}
