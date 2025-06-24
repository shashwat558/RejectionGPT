"use client"

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
        console.log(data)
        
         router.push(`/interview/${interviewId}`)
        
        
    }
    
    

  } 
  return (
    <button className="absolute top-10 left-[20%] rounded-lg p-3 text-center text-md font-semibold bg-[#302e2e] border-t-2 border-t-[#464444] cursor-pointer text-gray-400 active:border-0 hover:bg-[#363535]" onClick={handleClick}>
             Try an interview
    </button>
  )
}

export default InterviewRedirectionBUtton;