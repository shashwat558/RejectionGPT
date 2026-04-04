import Link from "next/link"
import { Suspense } from "react"
import { FileText, Plus, BarChart3 } from "lucide-react"
import AnalyticsOverview from "@/components/analysisOverview"
import AnalyticsSearchList from "@/components/AnalyticsSearchList"
import EmptyState from "@/components/ui/empty-state"
import { createClientServer } from "@/lib/utils/supabase/server"
import { redirect } from "next/navigation"
import AnalyticsOverviewSkeleton from "./AnalyticsOverviewSkeleton"
import AnalyticsSearchListSkeleton from "./AnalyticsSearchListSkeleton"
import { getAllFeedbacks } from "@/lib/actions/actions"

export const revalidate = 60

async function AnalyticsContent() {
  const feedbackData = await getAllFeedbacks()

  return (
    <>
      <Suspense fallback={<AnalyticsOverviewSkeleton />}>
        <AnalyticsOverview data={feedbackData} />
      </Suspense>

      {/* Recent Analyses with Search */}
      <Suspense fallback={<AnalyticsSearchListSkeleton />}>
        <div className="mt-12">
          {feedbackData.length > 0 ? (
            <AnalyticsSearchList data={feedbackData} />
          ) : (
            <EmptyState
              title="No analyses yet"
              description="Upload your resume and a job description to get started."
              icon={<FileText className="w-12 h-12" />}
              action={
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Analysis</span>
                </Link>
              }
            />
          )}
        </div>
      </Suspense>
    </>
  )
}

export default async function AnalyticsDashboardPage() {
  const supabase = await createClientServer();
  const {data} = await supabase.auth.getUser();
  if(!data.user){
    redirect(`${process.env.SITE_URL}/login`)
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-gray-200 text-black text-xs font-medium mb-3 shadow-sm">
              <BarChart3 className="w-4 h-4 mr-1.5 text-gray-500" />
              <span>Resume Analytics</span>
            </div>
            <h1 className="text-3xl md:text-4xl text-black font-bold tracking-tight">Your Resume Performance</h1>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors self-start md:self-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Analysis</span>
          </Link>
        </div>

        <Suspense fallback={<AnalyticsOverviewSkeleton />}>
          <AnalyticsContent />
        </Suspense>
        
      </div>
    </div>
  )
}
