"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

enum ExperienceLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  EXPERT = "expert",
}

export default function RoadmapGenerateButton({
  analysisId,
  
}: {
  analysisId: string
  

}) {
  const [loading, setLoading] = useState(false)
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(ExperienceLevel.BEGINNER)
  const router = useRouter()

  const onClick = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/get-diagram?analysisId=${analysisId}&experienceLevel=${experienceLevel}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      
      })
      if (!res.ok) {
        setLoading(false)
        return
      }
      router.push(`/analytics/${analysisId}/roadmap `)
    } catch (e) {
      console.error("Roadmap generation error:", e)
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={experienceLevel} onValueChange={(value) => setExperienceLevel(value as ExperienceLevel)}>
        <SelectTrigger>
          <SelectValue placeholder="Select experience level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ExperienceLevel.BEGINNER}>Beginner</SelectItem>
          <SelectItem value={ExperienceLevel.INTERMEDIATE}>Intermediate</SelectItem>
          <SelectItem value={ExperienceLevel.EXPERT}>Expert</SelectItem>
        </SelectContent>
      </Select>
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#333] hover:bg-[#444] disabled:opacity-60 text-gray-300 rounded-md text-sm transition-colors"
    >
      {loading ? "Generating…" : "Get Roadmap"}
    </button>
    </div>
  )
}

