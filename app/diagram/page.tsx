import Link from "next/link"
import { createClientServer } from "@/lib/utils/supabase/server"
import { redirect } from "next/navigation"
import { getAllFeedbacks } from "@/lib/actions/actions"

import RoadmapGenerateButton from "@/components/RoadmapGenerateButton"

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
    <main
      className="mx-auto w-full max-w-6xl p-6 min-h-screen"
    >
      <section className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-300 ">Roadmap</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate personalized learning roadmaps tailored to each analysis or view existing roadmaps.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feedbacks.map((fb) => {
          const hasRoadmap = withRoadmaps.has(fb.id);
          return (
            <div key={fb.id} className="bg-[#252525] border border-[#383838] rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="text-gray-200 font-medium truncate max-w-[70%]">{fb.jobTitle || "Untitled Role"}</div>
                <div className="text-xs px-1.5 py-0.5 rounded-full bg-[#333] text-gray-300">{fb.matchScore}</div>
              </div>
              <div className="text-xs text-gray-500 truncate">{fb.company || "Unknown Company"}</div>
              <div className="text-xs text-gray-500">{fb.date}</div>

              <div className="pt-2">
                {hasRoadmap ? (
                  <Link
                    href={`/analytics/${fb.id}/diagram`}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#333] hover:bg-[#444] text-gray-300 rounded-md text-sm transition-colors"
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
  )
}

