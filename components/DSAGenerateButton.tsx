"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DSAGenerateButton({
  analysisId,
  feedback,
}: {
  analysisId: string
  feedback: {
    jobTitle?: string
    company?: string
    matchScore?: string
    description?: string
  }
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onClick = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/get-dsa-ques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, analysisId }),
      })
      if (!res.ok) {
        setLoading(false)
        return
      }
      router.push(`/analytics/${analysisId}/practise`)
    } catch (e) {
      console.error("DSA questions generation error:", e)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#333] hover:bg-[#444] disabled:opacity-60 text-gray-300 rounded-md text-sm transition-colors"
    >
      {loading ? "Generating…" : "Get DSA Questions"}
    </button>
  )
}


