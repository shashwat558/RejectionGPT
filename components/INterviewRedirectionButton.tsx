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
      className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-black font-medium text-sm border border-gray-200 shadow-sm transition-colors flex items-center justify-center"
    >
      <Brain className="w-4 h-4 mr-2" />
      Mock Interview
    </LoadingButton>
  )
}

export default InterviewRedirectionBUtton;