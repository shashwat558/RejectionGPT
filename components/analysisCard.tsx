import Link from "next/link"
import { Calendar, Briefcase, ArrowRight } from "lucide-react"
import type { AnalysisSummary } from "@/lib/types/analytics"

interface AnalysisCardProps {
  feedback: AnalysisSummary
}

export default function AnalysisCard({ feedback }: AnalysisCardProps) {
  const getScoreColor = (score: string) => {
    const numeric = parseInt(score.replace("%", ""));
    const clamped = Math.max(0, Math.min(numeric, 100));

    const hue = (clamped * 1.2);

    return {
      backgroundColor: `hsl(${hue}, 80%, 94%)`,
      color: `hsl(${hue}, 80%, 25%)`
    };
  };

  const { backgroundColor, color } = getScoreColor(feedback.matchScore);

  return (
    <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] transition-all duration-300 group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-black font-bold tracking-tight truncate max-w-[80%]">{feedback.jobTitle}</h3>
          <div className={`px-2.5 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold`} style={{ backgroundColor, color }}>
            {feedback.matchScore}
          </div>
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-2 font-medium">
          <Briefcase className="w-4 h-4 mr-2" />
          {feedback.company}
        </div>

        <div className="flex items-center text-gray-400 text-xs mb-4">
          <Calendar className="w-3.5 h-3.5 mr-2" />
          {feedback.date}
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-6">
          {feedback.description ||
            "This analysis compares your resume against the job requirements and provides recommendations for improvement."}
        </p>

        <Link
          href={`/analytics/${feedback.id}`}
          className="inline-flex items-center font-medium text-black text-sm group-hover:text-gray-600 transition-colors"
        >
          View Analysis
          <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}