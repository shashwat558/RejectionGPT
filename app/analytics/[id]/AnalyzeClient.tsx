"use client"

import ActionButtons from "@/components/actionButton"
import ChatRedirectButton from "@/components/ChatRedirectButton"
import FeedbackSection from "@/components/feedbackSection"
import FeedbackSidebar from "@/components/feedbackSidebar"
import InterviewRedirectionBUtton from "@/components/INterviewRedirectionButton"
import MatchScoreBadge from "@/components/MatchScore"
import MobileSidebarToggle from "@/components/mobileSidebar"




import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Star, Zap, FileText } from "lucide-react"
import Link from "next/link"










export default function AnalysisClient({ analysisId, analysisData, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feedbackHistory }: { analysisId:string, analysisData: any, feedbackHistory: any }) {

   

  

  if (!analysisData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      
      <MobileSidebarToggle feedbacks={feedbackHistory} currentId={analysisId} />

      
 
     
      <FeedbackSidebar feedbacks={feedbackHistory} currentId={analysisId} />

      <div className="flex-1 overflow-y-auto">
        <div className="w-full flex flex-col items-center p-2 pt-10">
          <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-gray-50 to-transparent pointer-events-none" />
           
          <div className="max-w-4xl w-full p-6 md:p-10 flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm relative z-10 mb-8">
            
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <ChatRedirectButton resumeId={analysisData.resume_id} descId={analysisData.desc_id} />
                <InterviewRedirectionBUtton analysisId={analysisId}/>
              </div>
              
              <Link href="/" className="flex items-center text-gray-500 hover:text-black font-medium transition-colors text-sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Upload
              </Link>

              
              

              <ActionButtons analysisId={analysisId} />
            </div>
           
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-black text-xs font-bold uppercase tracking-wider mb-6 self-start">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-black" />
              <span>Resume Analysis</span>
            </div>

            <h1 className="text-3xl md:text-5xl text-black font-bold tracking-tight mb-8">Your Resume Analysis</h1>

            <MatchScoreBadge score={analysisData.match_score} />

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
              <h3 className="text-black font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                Summary
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium">{analysisData.summary}</p>
            </div>
            

            <FeedbackSection
              title="Strengths"
              items={analysisData.strengths}
              icon={<CheckCircle className="w-5 h-5" />}
              color="bg-green-50 text-green-600"
            />

            <FeedbackSection
              title="Missing Skills"
              items={analysisData.missing_skills}
              icon={<AlertTriangle className="w-5 h-5" />}
              color="bg-yellow-50 text-yellow-600"
            />

            <FeedbackSection
              title="Areas for Improvement"
              items={analysisData.weak_points}
              icon={<XCircle className="w-5 h-5" />}
              color="bg-red-50 text-red-600"
            />

            <div className="mt-10 border-t border-gray-100 pt-8">
              <h3 className="text-black font-bold tracking-tight mb-5">What&apos;s Next?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-black hover:shadow-sm transition-all cursor-pointer group">
                  <h4 className="text-black font-semibold mb-2 flex items-center justify-between">
                    Improve Your Resume
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Apply the suggestions to strengthen your resume and increase your match score.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-black hover:shadow-sm transition-all cursor-pointer group">
                  <h4 className="text-black font-semibold mb-2">Try Another Job Description</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">See how your resume matches with different job requirements.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl w-full px-4 mb-20 relative z-10">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-1 text-yellow-400 mb-3">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-black font-medium leading-relaxed italic text-sm md:text-base">
                  &quot;After implementing the suggestions from this analysis, my callback rate increased by 70%. Turns out, I
                  was underselling my experience and using all the wrong buzzwords.&quot;
                </p>
                <p className="text-gray-500 text-xs mt-3 font-semibold uppercase tracking-wider">— Jamie R., Successfully Employed Human</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
