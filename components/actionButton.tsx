"use client"

import { useState } from "react"
import { Download, Share2 } from "lucide-react"

interface ActionButtonsProps {
  analysisId: string
}

export default function ActionButtons({ analysisId }: ActionButtonsProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      
      await new Promise((resolve) => setTimeout(resolve, 2000))

     
      const link = document.createElement("a")
      link.href = `/api/pdf/${analysisId}` 
      link.download = `resume-analysis-${analysisId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleShare = () => {
    
    navigator.clipboard.writeText(window.location.href)
    alert("Link copied to clipboard!")
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownloadPdf}
        disabled={isGeneratingPdf}
        className="flex items-center gap-1 px-3 py-1.5 bg-[#333] hover:bg-[#444] text-gray-300 rounded-md text-sm transition-colors disabled:opacity-50"
      >
        {isGeneratingPdf ? (
          <div className="w-4 h-4 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin mr-1"></div>
        ) : (
          <Download className="w-4 h-4" />
        )}
        Save as PDF
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-1 px-3 py-1.5 bg-[#333] hover:bg-[#444] text-gray-300 rounded-md text-sm transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
    </div>
  )
}