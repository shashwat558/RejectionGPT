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

interface DSAPageProps {
  analysisId: string
}

export default function DSASuggestionsPage({ analysisId }: DSAPageProps) {
  const [suggestions, setSuggestions] = useState<DSASuggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch("/api/get-dsa-ques", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysisId, feedback: null })
        })
        const data = await res.json()

        // API returns either a list of objects (from questions table) or an array of problems
        const mapped: DSASuggestion[] = (data.problems || []).map((p: any) => {
          // Normalize keys coming from different sources
          const title = p.name || p.title || p.problem_title || "Untitled"
          const difficulty = p.difficulty || p.level || "Medium"
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
  }, [analysisId])

  if (loading) {
    return <div className="py-10 text-center text-muted-foreground">Loading DSA suggestions...</div>
  }

  if (suggestions.length === 0) {
    return <div className="py-10 text-center text-muted-foreground">No DSA suggestions available yet.</div>
  }

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
      {suggestions.map((q, index) => (
        <Card key={index} className="transition-colors bg-[#252525] text-gray-300 border-t-2 border-0  border-[#202020]">
          <CardHeader className="space-y-2">
            <CardTitle className="text-pretty text-base leading-6">{q.title}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Topic: {q.topic}</span>
              <Badge variant="outline" className="ml-auto rounded-full px-2.5 py-0.5 text-xs text-gray-500">
                {q.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Practice and strengthen your skills with a curated problem from a trusted source.
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
                Solve
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
