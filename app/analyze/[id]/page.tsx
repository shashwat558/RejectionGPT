
import { getAllFeedbacks, getFeedback } from "@/lib/actions/actions";
import AnalysisClient from "./AnalyzeClient"







export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const analysisData = await getFeedback({ analysisId: id })

  






  
  const feedbackHistory = await getAllFeedbacks();

  if (!analysisData) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1e1e1e]">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-gray-400 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <AnalysisClient analysisData={analysisData} analysisId={id} feedbackHistory={feedbackHistory}/>
  )
}
