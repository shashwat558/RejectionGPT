interface MatchScoreBadgeProps {
  score: string
}

export default function MatchScoreBadge({ score }: MatchScoreBadgeProps) {
  const scoreNumber = parseInt(score.replace("%", "")) || 0

  let color = "bg-yellow-50 text-yellow-700 border border-yellow-200"
  let barColor = "bg-yellow-500"

  if (scoreNumber >= 80) {
    color = "bg-green-50 text-green-700 border border-green-200"
    barColor = "bg-green-500"
  } else if (scoreNumber < 50) {
    color = "bg-red-50 text-red-700 border border-red-200"
    barColor = "bg-red-500"
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2.5">
        <h3 className="text-black font-semibold tracking-tight">Match Score:</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>{score}</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 shadow-inner rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${scoreNumber}%` }}
        ></div>
      </div>
    </div>
  )
}
