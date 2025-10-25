"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"

interface DSASuggestion {
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  link: string
  topic: string
}

export type AnalysisFeedback = {
  match_score: string
  summary: string
  strengths: string[]
  missing_skills: string[]
  weak_points: string[]
  resume_id: string
  user_id: string
  desc_id: string
}

interface DSAPageProps {
  analysisId: string
  feedback: AnalysisFeedback
}

export default function DSASuggestionsPage({ analysisId, feedback }: DSAPageProps) {
  const [suggestions, setSuggestions] = useState<DSASuggestion[]>([])
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch("/api/get-dsa-ques", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysisId, feedback })
        })
        const data = await res.json() as { problems?: unknown[] }


        const mapped: DSASuggestion[] = (data.problems || []).map((raw) => {
          const p = raw as Partial<{
            name: string
            title: string
            problem_title: string
            difficulty: string
            level: string
            topic: string
            topic_tags: string[]
            link: string
            leetcode_url: string
          }>
          // Normalize keys coming from different sources
          const title = p.name || p.title || p.problem_title || "Untitled"
          const difficultyRaw = (p.difficulty || p.level || "Medium").toString()
          const difficulty = ["Easy","Medium","Hard"].includes(difficultyRaw)
            ? (difficultyRaw as "Easy"|"Medium"|"Hard")
            : "Medium"
          const topic = Array.isArray(p.topic_tags) ? p.topic_tags.join(", ") : p.topic || "General"
          const link = p.link || p.leetcode_url || (p.name ? `https://leetcode.com/problems/${(p.name as string).toLowerCase().replace(/[^a-z0-9]+/g,'-')}/` : "#")
          return { title, difficulty, topic, link }
        })

        setSuggestions(mapped)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchSuggestions()
  }, [analysisId, feedback])

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-gray-400">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-gray-400 rounded-full animate-spin mb-3" />
        <p className="text-sm">Fetching your tailored practice set...</p>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return <div className="py-10 text-center text-muted-foreground">No DSA suggestions available yet.</div>
  }

  // Difficulty color mapping
  const difficultyClass = (d: string) => {
    const v = d.toLowerCase()
    if (v === 'easy') return 'bg-green-500/15 text-green-400 border-green-500/30'
    if (v === 'hard') return 'bg-red-500/15 text-red-400 border-red-500/30'
    return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
  }

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {suggestions.map((q, index) => (
        <Card key={index} className="transition-colors bg-[#252525] text-gray-300 border border-[#2f2f2f] hover:border-[#3a3a3a]">
          <CardHeader className="space-y-3">
            <CardTitle className="text-pretty text-base leading-6">{q.title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`rounded-full px-2.5 py-0.5 text-xs border ${difficultyClass(q.difficulty)}`}>
                {q.difficulty}
              </div>
              {q.topic.split(',').map((t, i) => (
                <Badge key={i} variant="outline" className="rounded-full px-2.5 py-0.5 text-xs text-gray-400 border-[#3a3a3a]">
                  {t.trim()}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              {"Reason: "}
              <span className="text-gray-300">Improve skills aligned with this topic and difficulty.</span>
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="secondary" className="w-full justify-center gap-2">
              <a
                href={q.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Solve ${q.title} on external site`}
              >
                Solve on LeetCode
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
