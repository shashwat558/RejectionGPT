import Link from "next/link"

import { FileText, Plus, BarChart3 } from "lucide-react"
import { getAllFeedbacks } from "@/lib/actions/actions"
import AnalyticsOverview from "@/components/analysisOverview"
import AnalyticsSearchList from "@/components/AnalyticsSearchList"
import { createClientServer } from "@/lib/utils/supabase/server"
import { redirect } from "next/navigation"


export default async function AnalyticsDashboardPage() {

  const supabase = await createClientServer();
  const {data} = await supabase.auth.getUser();
  if(!data.user){
    redirect(`${process.env.SITE_URL}/login`)
  }
  
  
  const feedbackData = await getAllFeedbacks()


  return (
    <div className="min-h-screen ">
      <div className="absolute top-0 left-0 w-full h-[300px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
       
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#333] text-gray-300 text-xs font-medium mb-2">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              <span>Resume Analytics</span>
            </div>
            <h1 className="text-3xl md:text-4xl text-gray-300 font-bold">Your Resume Performance</h1>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#333] hover:bg-[#444] text-gray-300 rounded-md text-sm transition-colors self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>New Analysis</span>
          </Link>
        </div>

       
        <AnalyticsOverview data={feedbackData} />

        {/* Recent Analyses with Search */}
        <div className="mt-10">
          {feedbackData.length > 0 ? (
            <AnalyticsSearchList data={feedbackData} />
          ) : (
            <div className="bg-[#252525] border border-[#383838] rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-gray-300 text-lg font-medium mb-2">No analyses yet</h3>
              <p className="text-gray-500 mb-6">Upload your resume and a job description to get started</p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#333] hover:bg-[#444] text-gray-300 rounded-md text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Analysis</span>
              </Link>
            </div>
          )}
        </div>

        
        
      </div>
    </div>
  )
}
