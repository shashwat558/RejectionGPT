"use client"

import ActionButtons from "@/components/actionButton"
import ChatRedirectButton from "@/components/ChatRedirectButton"
import FeedbackSection from "@/components/feedbackSection"
import FeedbackSidebar from "@/components/feedbackSidebar"
import InterviewRedirectionBUtton from "@/components/INterviewRedirectionButton"
import MatchScoreBadge from "@/components/MatchScore"
import MobileSidebarToggle from "@/components/mobileSidebar"
import { Button } from "@/components/ui/button"



import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Star, Zap, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"








export default function AnalysisClient({ analysisId, analysisData, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feedbackHistory }: { analysisId:string, analysisData: any, feedbackHistory: any }) {

    const router = useRouter();

  

  if (!analysisData) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1e1e1e]">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-gray-400 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      
      <MobileSidebarToggle feedbacks={feedbackHistory} currentId={analysisId} />

      
 
     
      <FeedbackSidebar feedbacks={feedbackHistory} currentId={analysisId} />

      <div className="flex-1 overflow-y-auto">
        <div className="w-full flex flex-col items-center p-2 pt-10">
          <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#303030]/20 to-transparent pointer-events-none" />
           
          <div className="max-w-4xl w-full p-6 md:p-8 flex flex-col rounded-lg border-t-3 border-[#383838] bg-[#252525] shadow-xl relative z-10">
            
            <div className="flex justify-between items-center mb-6">
              <ChatRedirectButton resumeId={analysisData.resume_id} descId={analysisData.desc_id} />
              <InterviewRedirectionBUtton analysisId={analysisId}/>
              
              <Link href="/" className="flex items-center text-gray-400 hover:text-gray-300 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Upload
              </Link>

              
              

              <ActionButtons analysisId={analysisId} />
            </div>
            <Button onClick={() => router.push(`/analyze/${analysisId}/practise`)}>Practice Questions</Button>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#333] text-gray-300 text-xs font-medium mb-4 self-start">
              <FileText className="w-4 h-4 mr-1 text-gray-400" />
              <span>Resume Analysis</span>
            </div>

            <h1 className="text-3xl md:text-4xl text-gray-300 font-bold mb-6">Your Resume Analysis</h1>

            <MatchScoreBadge score={analysisData.match_score} />

            <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-5 mb-6">
              <h3 className="text-gray-300 font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Summary
              </h3>
              <p className="text-gray-400">{analysisData.summary}</p>
            </div>
            

            <FeedbackSection
              title="Strengths"
              items={analysisData.strengths}
              icon={<CheckCircle className="w-5 h-5" />}
              color="bg-green-500/20 text-green-400"
            />

            <FeedbackSection
              title="Missing Skills"
              items={analysisData.missing_skills}
              icon={<AlertTriangle className="w-5 h-5" />}
              color="bg-yellow-500/20 text-yellow-400"
            />

            <FeedbackSection
              title="Areas for Improvement"
              items={analysisData.weak_points}
              icon={<XCircle className="w-5 h-5" />}
              color="bg-red-500/20 text-red-400"
            />

            <div className="mt-8 border-t border-[#383838] pt-6">
              <h3 className="text-gray-300 font-semibold mb-4">What&apos;s Next?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4 hover:bg-[#303030] transition-colors cursor-pointer">
                  <h4 className="text-gray-300 font-medium mb-2">Improve Your Resume</h4>
                  <p className="text-gray-500 text-sm">
                    Apply the suggestions to strengthen your resume and increase your match score.
                  </p>
                </div>

                <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4 hover:bg-[#303030] transition-colors cursor-pointer">
                  <h4 className="text-gray-300 font-medium mb-2">Try Another Job Description</h4>
                  <p className="text-gray-500 text-sm">See how your resume matches with different job requirements.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl w-full px-4 my-8">
            <div className="bg-[#252525] p-4 rounded-lg border border-[#383838]">
              <div className="flex items-center gap-1 text-yellow-400 mb-2">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-gray-400 text-sm">
                &quot;After implementing the suggestions from this analysis, my callback rate increased by 70%. Turns out, I
                was underselling my experience and using all the wrong buzzwords.&quot;
              </p>
              <p className="text-gray-500 text-xs mt-2">— Jamie R., Successfully Employed Human</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
