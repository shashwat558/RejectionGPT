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
      <div className="py-16 flex flex-col items-center justify-center text-gray-500">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Fetching your tailored practice set...</p>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return <div className="py-10 text-center text-gray-500 font-medium">No DSA suggestions available yet.</div>
  }

  // Difficulty color mapping
  const difficultyClass = (d: string) => {
    const v = d.toLowerCase()
    if (v === 'easy') return 'bg-green-50 text-green-700 border-green-200'
    if (v === 'hard') return 'bg-red-50 text-red-700 border-red-200'
    return 'bg-yellow-50 text-yellow-700 border-yellow-200'
  }

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {suggestions.map((q, index) => (
        <Card key={index} className="transition-all bg-white text-black border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md rounded-xl">
          <CardHeader className="space-y-3 pb-4">
            <CardTitle className="text-pretty text-lg font-semibold leading-tight">{q.title}</CardTitle>
            <div className="items-center gap-2 flex flex-wrap">
              
              <div className={`rounded-md max-w-fit px-2.5 py-0.5 text-xs font-bold border ${difficultyClass(q.difficulty)}`}>
                {q.difficulty}
              </div>

              {q.topic.split(',').map((t, i) => (
                <Badge key={i} variant="outline" className="rounded-md px-2.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-50 border-gray-200">
                  {t.trim()}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-semibold text-black block mb-1">Reason:</span>
              {q.reason_suggested}
            </p>
          </CardContent>
          <CardFooter className="pt-2 pb-5">
            <Button asChild variant="secondary" className="w-full justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-black border border-gray-200 transition-colors shadow-sm font-medium rounded-lg">
              <a
                href={q.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Solve ${q.title} on external site`}
              >
                Solve on LeetCode
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
