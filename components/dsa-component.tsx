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
  reason_suggested: string
}



interface DSAPageProps {
  analysisId: string
  
}

export default function DSASuggestionsPage({ analysisId}: DSAPageProps) {
  const [suggestions, setSuggestions] = useState<DSASuggestion[]>([])
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/get-dsa-ques?analysisId=${encodeURIComponent(analysisId)}`, {
          method: "GET"
        })
        const data = await res.json() as { problems?: unknown[] }

        const mapped: DSASuggestion[] = (data.problems || []).map((raw) => {
          const p = raw as Partial<{
            title: string
            difficulty: string
            topic_tags: string[]
            reason_suggested: string
          }>
          const title = p.title || "Untitled"
          const difficultyRaw = (p.difficulty || "Medium").toString()
          const difficulty = ["Easy","Medium","Hard"].includes(difficultyRaw)
            ? (difficultyRaw as "Easy"|"Medium"|"Hard")
            : "Medium"
          const topic = Array.isArray(p.topic_tags) ? p.topic_tags.join(", ") : "General"
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-')
          const link = `https://leetcode.com/problems/${slug}/`
          return { title, difficulty, topic, link, reason_suggested: p.reason_suggested || "No reason provided" }
        })
        console.log(mapped)

        setSuggestions(mapped)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchSuggestions()
  }, [analysisId])

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
            <div className="items-center gap-2 flex-wrap">
              
              <div className={`rounded-full max-w-fit px-2.5 py-0.5 text-xs border ${difficultyClass(q.difficulty)}`}>
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
              <span className="text-gray-300">{q.reason_suggested}</span>
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
