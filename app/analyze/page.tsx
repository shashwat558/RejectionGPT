import Link from "next/link"

import { FileText, Plus, BarChart3, Search } from "lucide-react"
import { getAllFeedbacks } from "@/lib/actions/actions"
import AnalyticsOverview from "@/components/analysisOverview"
import FilterDropdown from "@/components/filterDropdown"
import AnalysisCard from "@/components/analysisCard"
import { createClientServer } from "@/lib/utils/supabase/server"
import { redirect } from "next/navigation"


export default async function AnalyzeDashboardPage() {

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

        {/* Recent Analyses */}
        <div className="mt-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gray-700"></div>
              <h2 className="text-xl text-gray-300 font-semibold">Recent Analyses</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search analyses..."
                  className="w-full md:w-64 pl-9 pr-3 py-2 bg-[#252525] border border-[#383838] rounded-md text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#444]"
                />
              </div>

              <FilterDropdown />
            </div>
          </div>

          {/* Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedbackData.map((feedback) => (
              <AnalysisCard key={feedback.id} feedback={feedback} />
            ))}
          </div>

          {feedbackData.length === 0 && (
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
