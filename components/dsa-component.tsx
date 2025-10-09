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
  userId: string
}

export default function DSASuggestionsPage({ userId }: DSAPageProps) {
  const [suggestions, setSuggestions] = useState<DSASuggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const dummySuggestions: DSASuggestion[] = [
      { title: "Two Sum", difficulty: "Easy", topic: "Arrays", link: "https://leetcode.com/problems/two-sum/" },
      {
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        topic: "Strings",
        link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      },
      {
        title: "Median of Two Sorted Arrays",
        difficulty: "Hard",
        topic: "Divide and Conquer",
        link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
      },
      {
        title: "Valid Parentheses",
        difficulty: "Easy",
        topic: "Stack",
        link: "https://leetcode.com/problems/valid-parentheses/",
      },
      {
        title: "Merge k Sorted Lists",
        difficulty: "Hard",
        topic: "Heap / Linked List",
        link: "https://leetcode.com/problems/merge-k-sorted-lists/",
      },
      {
        title: "Number of Islands",
        difficulty: "Medium",
        topic: "DFS / BFS",
        link: "https://leetcode.com/problems/number-of-islands/",
      },
    ]

    setSuggestions(dummySuggestions)
    setLoading(false)
  }, [userId])

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
