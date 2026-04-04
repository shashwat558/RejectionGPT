"use client"

import { useState } from "react"
import { Download, Share2 } from "lucide-react"
import LoadingButton from "@/components/ui/loading-button"

interface ActionButtonsProps {
  analysisId: string
}

export default function ActionButtons({ analysisId }: ActionButtonsProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [shareMessage, setShareMessage] = useState<string | null>(null)

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

  const handleShare = async () => {
    setIsSharing(true)
    setShareMessage(null)
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareMessage("Link copied")
    } catch (error) {
      console.error("Share failed", error)
      setShareMessage("Unable to copy link")
    } finally {
      setIsSharing(false)
      setTimeout(() => setShareMessage(null), 2000)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <LoadingButton
        onClick={handleDownloadPdf}
        isLoading={isGeneratingPdf}
        loadingText="Preparing"
        className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm text-black font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        Save as PDF
      </LoadingButton>

      <LoadingButton
        onClick={handleShare}
        isLoading={isSharing}
        loadingText="Sharing"
        className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm text-black font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </LoadingButton>

      {shareMessage && <span className="text-sm font-medium text-gray-500">{shareMessage}</span>}
    </div>
  )
}