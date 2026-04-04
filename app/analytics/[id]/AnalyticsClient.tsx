"use client"

import ActionButtons from "@/components/actionButton"
import ChatRedirectButton from "@/components/ChatRedirectButton"
import FeedbackSidebar from "@/components/feedbackSidebar"
import InterviewRedirectionBUtton from "@/components/INterviewRedirectionButton"
import MobileSidebarToggle from "@/components/mobileSidebar"
import { AlertTriangle, ArrowLeft, Zap, Trophy, Target, Brain } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { AnalysisDetail, AnalysisSummary } from "@/lib/types/analytics"

export default function AnalyticsClient({
  analysisId,
  analysisData,
  feedbackHistory,
}: {
  analysisId: string
  analysisData: AnalysisDetail
  feedbackHistory: AnalysisSummary[]
}) {

    if (!analysisData) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  const matchScore = Number.isFinite(analysisData.match_score) ? analysisData.match_score : 0
  const sentimentColor = matchScore > 70 ? "text-emerald-600" : matchScore > 40 ? "text-amber-600" : "text-rose-600";
  const sentimentBg = matchScore > 70 ? "bg-emerald-50" : matchScore > 40 ? "bg-amber-50" : "bg-rose-50";
  const sentimentBorder = matchScore > 70 ? "border-emerald-200" : matchScore > 40 ? "border-amber-200" : "border-rose-200";
  
  // Custom donut chart calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (matchScore / 100) * circumference;

  return (
    <div className="flex min-h-screen bg-gray-50/50 text-black selection:bg-gray-200">
      <MobileSidebarToggle feedbacks={feedbackHistory} currentId={analysisId} />
      <FeedbackSidebar feedbacks={feedbackHistory} currentId={analysisId} />

      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden custom-scrollbar bg-white">
        {/* Hero Background */}
        <div className="absolute top-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-white to-white pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <Link href="/analytics" className="inline-flex items-center text-sm text-gray-500 font-medium hover:text-black transition-colors mb-3 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
                Analysis Report
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
               <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <ChatRedirectButton resumeId={analysisData.resume_id} descId={analysisData.desc_id} />
                  <InterviewRedirectionBUtton analysisId={analysisId} />
                  <ActionButtons analysisId={analysisId} />
               </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Score Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1 min-h-[300px] rounded-3xl bg-white border border-gray-200 p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-sm"
            >
              
              <div className="relative z-10 flex flex-col items-center">
                 <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg viewBox="0 0 192 192" className="w-full h-full -rotate-90 transform">
                      <circle
                        cx="96" cy="96" r="60"
                        className="stroke-gray-100"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="96" cy="96" r="60"
                        className={`stroke-current ${sentimentColor}`}
                        strokeWidth="12"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                      />
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-5xl font-bold ${sentimentColor} tracking-tighter`}>
                        {matchScore}
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Score</span>
                    </div>
                 </div>
                 
                 <div className={`mt-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${sentimentBg} ${sentimentColor} border ${sentimentBorder}`}>
                    {matchScore > 70 ? "Excellent Match" : matchScore > 40 ? "Potential Fit" : "Needs Optimization"}
                 </div>
              </div>
            </motion.div>

            {/* Summary Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 rounded-3xl bg-white border border-gray-200 p-8 relative overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow"
            >
               
               
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 shadow-sm">
                   <Zap className="w-5 h-5 fill-amber-500" />
                 </div>
                 <h2 className="text-xl font-bold text-black tracking-tight">Executive Summary</h2>
               </div>
               
               <div className="flex-1">
                 <p className="text-gray-600 leading-relaxed text-lg font-medium">
                   {analysisData.summary}
                 </p>
               </div>
               
               <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <Brain className="w-4 h-4" /> AI Analysis
                  </div>
                  <span className="text-xs font-medium text-gray-500">{new Date().toLocaleDateString()}</span>
               </div>
            </motion.div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Strengths */}
            <FeedbackCard 
              title="Key Strengths" 
              items={analysisData.strengths} 
              icon={<Trophy className="w-5 h-5" />}
              color="text-emerald-600"
              bg="bg-emerald-50"
              border="border-emerald-200"
              delay={0.2}
            />

            {/* Missing Skills */}
            <FeedbackCard 
              title="Missing Skills" 
              items={analysisData.missing_skills} 
              icon={<Target className="w-5 h-5" />}
              color="text-amber-600"
              bg="bg-amber-50"
              border="border-amber-200"
              delay={0.3}
            />

            {/* Weaknesses */}
            <FeedbackCard 
              title="Areas to Improve" 
              items={analysisData.weak_points} 
              icon={<AlertTriangle className="w-5 h-5" />}
              color="text-rose-600"
              bg="bg-rose-50"
              border="border-rose-200"
              delay={0.4}
            />
          </div>

          {/* Action Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
             <div className="group rounded-3xl bg-white border border-gray-200 p-6 hover:border-black transition-all cursor-pointer shadow-sm hover:shadow-md">
                <div className="flex items-start justify-between">
                   <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                      <Target className="w-6 h-6 text-gray-600 group-hover:text-black" />
                   </div>
                   <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:translate-x-1 group-hover:text-black transition-all" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-black tracking-tight">Refine Your Resume</h3>
                <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">Use the feedback above to bridge the gap. Adding missing keywords can boost your ATS score significantly.</p>
             </div>

             <div className="group rounded-3xl bg-white border border-gray-200 p-6 hover:border-black transition-all cursor-pointer shadow-sm hover:shadow-md">
                <div className="flex items-start justify-between">
                   <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                      <Target className="w-6 h-6 text-gray-600 group-hover:text-black" />
                   </div>
                   <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:translate-x-1 group-hover:text-black transition-all" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-black tracking-tight">Compare Another Role</h3>
                <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">Testing against multiple job descriptions helps you create a more versatile master resume.</p>
             </div>
          </div>


        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FeedbackCard({ title, items, icon, color, bg, border, delay }: { title: string, items: string[], icon: any, color: string, bg: string, border: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-3xl bg-white border border-gray-200 p-6 flex flex-col h-full hover:border-gray-300 hover:shadow-md transition-all shadow-sm"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-2xl ${bg} ${color} border ${border} shrink-0`}>
          {icon}
        </div>
        <div>
            <h3 className="text-lg font-bold text-black tracking-tight">{title}</h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{items?.length || 0} POINTS</span>
        </div>
      </div>
      
      <div className="space-y-4 flex-1">
        {items && items.length > 0 ? (
          items.map((item, idx) => (
             <div key={idx} className="flex gap-3 items-start group">
                <div className={`relative mt-2 w-1.5 h-1.5 rounded-full opacity-30 shrink-0 bg-black`} /> 
                <p className="text-sm text-gray-600 font-medium leading-relaxed">{item}</p>
             </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center py-8 opacity-50">
             <p className="text-sm font-medium italic text-gray-500">Nothing to report</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
