"use client"
import { QuestionType } from '@/app/interview/[id]/InterviewClient'
import { ArrowRight, Clock, Mic, MicOff, SkipForward } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { useSpeechRecognition } from 'react-speech-recognition';

interface InterviewQuestionProps {
    question: QuestionType,
    questionNumber: number,
    totalQuestions: number,
    onAnswerSubmit: (answer: string, timeSpent: number) => void;
}



const InterviewQuestions = ({
    question,
    questionNumber,
    totalQuestions,
    onAnswerSubmit
}:InterviewQuestionProps) => {
    const [timeLeft, setTimeLeft] = useState(60);
    const [answer, setAnswer] = useState("");
    const [isActive, setIsActive] = useState(false)
    const [isListening, setIsListening] = useState(false);
    const startTimeRef = useRef<number>(Date.now());
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
} = useSpeechRecognition();


    useEffect(() => {
        startTimeRef.current = Date.now();
        setIsActive(true);
        setTimeLeft(1200);
        setAnswer("");
        textAreaRef.current?.focus()

    },[question.id])

    const handleSubmit = () => {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        setIsActive(false);
        onAnswerSubmit(answer, timeSpent)
    }

    useEffect(() => {
        let Interval:NodeJS.Timeout;
        if(isActive && timeLeft > 0){
            Interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if(prev <= 1){
                        setIsActive(false);
                        handleSubmit()
                    } else {
                        return prev - 1
                    }
                })
                
            }, 1000)
        }
        
        return () => clearInterval(Interval)
    },[isActive, timeLeft])

    const getTimeColor = () => {
        if(timeLeft > 30) return "text-green-400"
        if(timeLeft > 10) return "text-yellow-400"
        return "text-red-500"
    }

    const handleSkip = () => {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        setIsActive(false);
        onAnswerSubmit("", timeSpent);
        
    }

    const getTimePassingWidth = () => {
        return `${(timeLeft/60) * 100}%`
    } 


    
  return (
    <div className="flex flex-col min-h-screen py-8">
      
      <div className="bg-[#252525] rounded-xl border border-[#383838] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm">
              Question {questionNumber} of {totalQuestions}
            </span>

          </div>

          <div className="flex items-center gap-4">
            

            <div className={`flex items-center gap-2 ${getTimeColor()}`}>
              <Clock className="w-5 h-5" />
              <span className="text-2xl font-mono font-bold">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#333] rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              timeLeft > 30 ? "bg-green-500" : timeLeft > 10 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: getTimePassingWidth() }}
          ></div>
        </div>

        {/* Overall Progress */}
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            Progress: {questionNumber}/{totalQuestions}
          </span>
          <span>{Math.round(((questionNumber - 1) / totalQuestions) * 100)}% Complete</span>
        </div>
      </div>

     

      {/* Question */}
      <div className="bg-[#252525] rounded-xl border border-[#383838] p-8 mb-6 flex-1">
        <h2 className="text-2xl font-semibold text-gray-200 mb-6 leading-relaxed">{question.question_text}</h2>

        <div className="space-y-4">
          <div className='flex gap-5 items-center justify-between w-full'>
            <label className="block text-gray-400 text-sm font-medium">Your Answer:</label>
            <div className='p-2 rounded-full border-gray-700 border-[1px]'>
              {isListening ? <MicOff onClick={() => setIsListening(false)} className={`text-white size-7`} />:
              
              <Mic onClick={() => setIsListening(true)} className={`text-white size-7 `} />
            }

            </div>
          
          </div>
          
          <textarea
            ref={textAreaRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here... Be specific and provide examples when possible."
            className="w-full h-64 p-4 bg-[#2a2a2a] border border-[#383838] rounded-lg text-gray-300 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            disabled={!isActive}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{answer.length} characters</span>
            <span>{answer.split(" ").filter((word) => word.length > 0).length} words</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleSkip}
          disabled={!isActive}
          className="flex items-center gap-2 px-4 py-2 bg-[#333] hover:bg-[#444] text-gray-400 hover:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4" />
          Skip Question
        </button>

        <button
          onClick={handleSubmit}
          disabled={!isActive || !answer.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {questionNumber === totalQuestions ? "Finish Interview" : "Next Question"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  
  )
}

export default InterviewQuestions