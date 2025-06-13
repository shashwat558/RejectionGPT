interface MatchScoreBadgeProps {
  score: string
}

export default function MatchScoreBadge({ score }: MatchScoreBadgeProps) {
  const scoreNumber = parseInt(score.replace("%", "")) || 0

  let color = "bg-yellow-500/20 text-yellow-400"
  let barColor = "bg-yellow-400"

  if (scoreNumber >= 80) {
    color = "bg-green-500/20 text-green-400"
    barColor = "bg-green-400"
  } else if (scoreNumber < 50) {
    color = "bg-red-500/20 text-red-400"
    barColor = "bg-red-400"
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-gray-300 font-medium">Match Score:</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{score}</span>
      </div>
      <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor}`}
          style={{ width: `${scoreNumber}%` }}
        ></div>
      </div>
    </div>
  )
}
