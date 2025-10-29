"use client"

import { Brain } from 'lucide-react';
import {  useRouter } from 'next/navigation';
import React from 'react'

const InterviewRedirectionBUtton = ({analysisId}: {analysisId: string}) => {
    const router = useRouter();
    const handleClick = async() => {
    const response = await fetch("/api/questions", {
        method: "POST",
        body: JSON.stringify({analysisId: analysisId}),
        headers: {
            "Content-Type": "application/json"
        }
    })
    if(response.ok){
        const data = await response.json();
        const interviewId = data.interviewId;
        console.log(data.isCompleted)
         if(data.isCompleted === "completed"){
          router.push( `/interview/result/${interviewId}`)
         } else {
         router.push(`/interview/${interviewId}`)
         }
        
    }
    
    

  } 
  return (
    <button className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-[#333] hover:bg-[#444] text-gray-200 text-sm transition-colors border border-[#3a3a3a]" onClick={handleClick}>
      <Brain className="w-4 h-4 mr-1" />
             Mock Interview
    </button>
  )
}

export default InterviewRedirectionBUtton;