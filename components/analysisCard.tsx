import Link from "next/link"
import { Calendar, Briefcase, ArrowRight } from "lucide-react"

interface AnalysisCardProps {
  feedback: {
    id: string
    jobTitle: string
    company: string
    date: string
    matchScore: string
    description?: string
  }
}

export default function AnalysisCard({ feedback }: AnalysisCardProps) {
  const getScoreColor = (score: string) => {
  const numeric = parseInt(score.replace("%", ""));
  const clamped = Math.max(0, Math.min(numeric, 100));
  
  const hue = (clamped * 1.2);

   return {
    backgroundColor: `hsl(${hue}, 70%, 20%)`,
    color: `hsl(${hue}, 70%, 60%)`
  };
};


const { backgroundColor, color } = getScoreColor(feedback.matchScore);


  return (
    <div className="bg-[#252525] border border-[#383838] rounded-lg overflow-hidden hover:border-[#444] transition-colors group">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-gray-300 font-medium truncate max-w-[80%]">{feedback.jobTitle}</h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium`} style={{ backgroundColor, color }}>
            {feedback.matchScore}
          </div>
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-2">
          <Briefcase className="w-4 h-4 mr-1.5" />
          {feedback.company}
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-4">
          <Calendar className="w-4 h-4 mr-1.5" />
          {feedback.date}
        </div>

        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
          {feedback.description ||
            "This analysis compares your resume against the job requirements and provides recommendations for improvement."}
        </p>

        <Link
          href={`/analyze/${feedback.id}`}
          className="flex items-center text-gray-400 text-sm group-hover:text-gray-300 transition-colors"
        >
          View Analysis
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  )
}