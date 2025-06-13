interface MatchScoreBadgeProps {
  score: string
}

export default function MatchScoreBadge({ score }: MatchScoreBadgeProps) {
  let color = "bg-yellow-500/20 text-yellow-400"
  let width = "w-1/3"

  if (score === "High") {
    color = "bg-green-500/20 text-green-400"
    width = "w-full"
  } else if (score === "Low") {
    color = "bg-red-500/20 text-red-400"
    width = "w-1/6"
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-gray-300 font-medium">Match Score:</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{score}</span>
      </div>
      <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden">
        <div className={`h-full ${color.replace("text-", "bg-")} ${width}`}></div>
      </div>
    </div>
  )
}
