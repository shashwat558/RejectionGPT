"use client";
import React, { useState } from 'react'
import {motion} from "framer-motion";
import { useRouter } from 'next/navigation';


const ResumeUploaderHome = () => {
    const [resume, setResume] = useState<File | null>(null);
    const [jobDesc, setJobDesc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()

    const handleSubmit = async () => {
        setIsLoading(true)
        const data = {resume, jobDesc};
        try {
            const response = await fetch("/api/analyzer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            if(response.ok){
                setIsLoading(false)
                const {id} = await response.json();
                if(id){
                    router.push(`/analyze/${id}`)
                }

                
                
            }
        } catch (error) {
            setIsLoading(false)
            console.error(error)
            
        } finally {
            setIsLoading(false)
        }
    }


  return (
    <motion.div 
  initial={{ opacity: 0, scale: 1.05 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }} 
  className='w-full flex justify-center items-center mt-10 p-2'
>
  <div className='xl:w-2/3 w-full p-8 flex justify-center items-center rounded-lg border-t-3 border-[#383838] bg-[#252525] shadow-xl'>
    <div className='flex w-full flex-col md:flex-row justify-between items-center gap-8 px-3'>
      <div className='flex flex-1 flex-col justify-center items-start gap-6 max-w-xl'>
        <h1 className='text-4xl md:text-5xl text-gray-300 font-[900] leading-tight'>
          Beat the rejection. <br />Land the job.
        </h1>
        <p className='text-xl text-gray-500 leading-relaxed'>
          Upload your resume and a job description. Get instant feedback, AI insights, and actionable improvements—before you hit send.
        </p>
      </div>
      
      <div className='flex flex-1 flex-col justify-center items-center gap-6 w-full max-w-md'>
        <div className='relative w-full h-72 border-dashed border-2 border-[#424141] rounded-xl flex flex-col items-center justify-center p-6 hover:border-[#555] transition-colors'>
          <svg 
            className="w-12 h-12 mb-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          <p className='text-gray-400 text-center mb-2'>Drag & drop your resume here</p>
          <p className='text-gray-500 text-sm'>or click to browse (PDF, DOC, DOCX)</p>
          <input 
            type="file"
            accept=".pdf,.doc,.docx"
            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
            onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
            disabled={isLoading}
          />
        </div>
        
        <textarea 
          placeholder='Paste job description here...'
          className='w-full h-32 p-4 rounded-lg bg-[#303030] text-gray-300 placeholder-gray-500 border border-[#424141] focus:outline-none focus:ring-2 focus:ring-[#555] resize-none'
          onChange={(e) => setJobDesc(e.target.value)}
          disabled={isLoading}
        />
        <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ 
                scale: 1.03,
                backgroundColor: "#555",
                
              }}
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className='w-full py-3 px-6 bg-[#424141] text-gray-300 font-medium rounded-lg transition-colors duration-300 shadow-md cursor-pointer'
              onClick={handleSubmit}
            >
              {isLoading? (<div className="relative flex items-center justify-center">
                <div className='w-6 h-6 border-2 border-gray-900 border-t-gray-600 rounded-full animate-spin' 
                    style={{ animationDuration: '0.8s' }} />
                </div>):"Analyze"}
            </motion.button>
      </div>
    </div>
  </div>
</motion.div>
  )
}

export default ResumeUploaderHome