import InterviewResults from '@/components/InterviewResult'
import React from 'react'

const page = async({params}: {params: Promise<{id: string}>}) => {
    const {id} = await params;
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <InterviewResults
            interviewId={id}

            
            
          />
        </div>
        </div>
    
  )
}

export default page