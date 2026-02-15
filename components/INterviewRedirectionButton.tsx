"use client"

import { Brain } from 'lucide-react';
import {  useRouter } from 'next/navigation';
import React from 'react'
import LoadingButton from '@/components/ui/loading-button';
import { createInterviewSession } from '@/lib/services/interview.client';

const InterviewRedirectionBUtton = ({analysisId}: {analysisId: string}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false)
    const handleClick = async() => {
    if (isLoading) return
    setIsLoading(true)
    try {
      const { interviewId, isCompleted } = await createInterviewSession(analysisId)
      
      if (isCompleted === "completed") {
        router.push(`/interview/result/${interviewId}`)
      } else {
        router.push(`/interview/${interviewId}`)
      }
    } catch (error) {
      console.error("Failed to start interview", error)
    } finally {
      setIsLoading(false)
    }
  } 
  return (
    <LoadingButton
      onClick={handleClick}
      isLoading={isLoading}
      loadingText="Preparing"
      className="px-3 py-2 rounded-md bg-[#333] hover:bg-[#444] text-gray-200 text-sm border border-[#3a3a3a]"
    >
      <Brain className="w-4 h-4 mr-1" />
      Mock Interview
    </LoadingButton>
  )
}

export default InterviewRedirectionBUtton;