import Link from "next/link"
import { createClientServer } from "@/lib/utils/supabase/server"
import { redirect } from "next/navigation"
import { getAllFeedbacks } from "@/lib/actions/actions"
import RoadmapGenerateButton from "@/components/RoadmapGenerateButton"
import { Briefcase, Calendar } from "lucide-react"

export default async function Page() {
  const supabase = await createClientServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect(`${process.env.SITE_URL}/login`)
  }

  const feedbacks = await getAllFeedbacks();

  const ids = feedbacks.map(f => f.id);
  let withRoadmaps = new Set<string>();
  if (ids.length > 0) {
    const { data: roadmapRows } = await supabase
      .from("roadmaps")
      .select("analysis_result_id")
      .in("analysis_result_id", ids);
    if (Array.isArray(roadmapRows)) {
      withRoadmaps = new Set(roadmapRows.map(r => String(r.analysis_result_id)));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <main className="mx-auto w-full max-w-6xl p-6 pt-24 min-h-screen">
        <section className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl text-black font-bold tracking-tight">Learning Roadmaps</h1>
          <p className="mt-3 text-gray-500 max-w-2xl">
            Generate personalized learning roadmaps tailored to each analysis or view existing roadmaps.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {feedbacks.map((fb) => {
            const hasRoadmap = withRoadmaps.has(fb.id);
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
                  {hasRoadmap ? (
                    <Link
                      href={`/analytics/${fb.id}/diagram`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      Go to Roadmap
                    </Link>
                  ) : (
                    <RoadmapGenerateButton
                      analysisId={fb.id}
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
