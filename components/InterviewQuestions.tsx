"use client"
import { QuestionType } from '@/app/interview/[id]/InterviewClient'
import { ArrowRight, Clock, Mic, MicOff, Pause, Play, SkipForward, Sparkles, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

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
    const [timeLeft, setTimeLeft] = useState(90);
    const [answer, setAnswer] = useState("");
    const [isActive, setIsActive] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [showStarHelper, setShowStarHelper] = useState(false)
    
    const startTimeRef = useRef<number>(Date.now());
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const {
    transcript,
    listening,
    resetTranscript,
    
} = useSpeechRecognition();


const startListening = () => SpeechRecognition.startListening({continuous: true, language: "en-IN"})
const stopListening = () => {
  SpeechRecognition.stopListening();
  resetTranscript()
}







    useEffect(() => {
      startTimeRef.current = Date.now();
      setIsActive(true);
      setIsPaused(false);
      setTimeLeft(90);
      setAnswer("");
      textAreaRef.current?.focus()

    },[question.id])

    useEffect(() => {
      if(listening){
        setAnswer(transcript)
      }
    },[transcript, listening])

    const handleSubmit = () => {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        setIsActive(false);
      setIsPaused(false);
        onAnswerSubmit(answer, timeSpent)
        resetTranscript()
    }

    useEffect(() => {
        let Interval:NodeJS.Timeout;
        if(isActive && timeLeft > 0 && !isPaused){
            Interval = setInterval(() => {
                
                setTimeLeft((prev) => {
                    if(prev <= 1){
                        setIsActive(false);
                        handleSubmit();
                        return 0;
                    } else {
                        return prev - 1;
                    }
                })
                
            }, 1000)
        }
        
        return () => clearInterval(Interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[isActive, timeLeft, isPaused])

    useEffect(() => {
      const handleKey = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key.toLowerCase() === "enter") {
          event.preventDefault()
          if (answer.trim() && isActive) {
            handleSubmit()
          }
        }
        if (event.ctrlKey && event.key.toLowerCase() === "p") {
          event.preventDefault()
          setIsPaused((prev) => !prev)
        }
        if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "s") {
          event.preventDefault()
          if (isActive) {
            handleSkip()
          }
        }
      }

      window.addEventListener("keydown", handleKey)
      return () => window.removeEventListener("keydown", handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answer, isActive])

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
        return `${(timeLeft/90) * 100}%`
    } 

    const words = answer.split(" ").filter((word) => word.length > 0).length
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
    const wordsPerMinute = Math.round((words / elapsedSeconds) * 60)

    const getCoachHint = () => {
      if (!answer.trim()) return "Start with a one-line headline that answers the question directly."
      if (words < 40) return "Add a concrete example or metric to make it vivid."
      if (wordsPerMinute > 180) return "Slow down and emphasize the impact in one sentence."
      if (timeLeft < 15) return "Wrap up with a result or lesson learned."
      return "Tie the answer back to the role and company context."
    }

    const handleNudge = (prompt: string) => {
      setAnswer((prev) => (prev ? `${prev}\n${prompt}` : prompt))
      textAreaRef.current?.focus()
    }


    
  return (
    <div className="flex flex-col min-h-screen py-8">
      
      <div className="bg-[#151515] rounded-2xl border border-white/10 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="text-xs text-gray-500 border border-white/10 rounded-full px-2 py-1">Focus mode</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs text-gray-300 hover:bg-white/10"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {isPaused ? "Resume" : "Pause"}
            </button>

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

     

    
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-6 flex-1">
        <div className="bg-[#151515] rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-semibold text-gray-200 mb-6 leading-relaxed">{question.question_text}</h2>

          <div className="space-y-4">
            <div className='flex gap-5 items-center justify-between w-full'>
              <label className="block text-gray-400 text-sm font-medium">Your Answer:</label>
              <div className='flex items-center gap-3'>
                {listening && (<h2 className='text-md text-gray-300'>Listening...</h2>)}
                <div className='p-2 rounded-full border-gray-700 border-[1px]'>
                
                {listening ? <MicOff onClick={stopListening} className={`text-white size-7`} />:
                
                <Mic onClick={startListening} className={`text-white size-7 `} />
              }

              </div>
              </div>
            </div>
            
            <textarea
              ref={textAreaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here... Be specific and provide examples when possible."
              className="w-full h-64 p-4 bg-[#1f1f1f] border border-white/10 rounded-xl text-gray-300 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20"
              disabled={!isActive}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{answer.length} characters</span>
              <span>{words} words</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#151515] rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Sparkles className="w-4 h-4" />
                Interview coach
              </div>
              <button
                onClick={() => setShowStarHelper((prev) => !prev)}
                className="text-xs text-gray-400 hover:text-gray-200"
              >
                {showStarHelper ? "Hide STAR" : "Show STAR"}
              </button>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-gray-300">
                {getCoachHint()}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-white/10 px-3 py-2 text-gray-300">
                  Pace: <span className="text-gray-100">{wordsPerMinute} wpm</span>
                </div>
                <div className="rounded-lg border border-white/10 px-3 py-2 text-gray-300">
                  Energy: <span className="text-gray-100">{timeLeft > 30 ? "steady" : "urgent"}</span>
                </div>
                <div className="rounded-lg border border-white/10 px-3 py-2 text-gray-300">
                  Focus: <span className="text-gray-100">{isPaused ? "paused" : "live"}</span>
                </div>
                <div className="rounded-lg border border-white/10 px-3 py-2 text-gray-300">
                  Voice: <span className="text-gray-100">{listening ? "listening" : "ready"}</span>
                </div>
              </div>
            </div>
          </div>

          {showStarHelper && (
            <div className="bg-[#151515] rounded-2xl border border-white/10 p-5 text-sm text-gray-300">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" />
                STAR framework
              </div>
              <ul className="space-y-2 text-gray-400">
                <li><span className="text-gray-200">Situation</span>: set context in one line.</li>
                <li><span className="text-gray-200">Task</span>: clarify your responsibility.</li>
                <li><span className="text-gray-200">Action</span>: 2 to 3 concrete steps you took.</li>
                <li><span className="text-gray-200">Result</span>: measurable impact or lesson.</li>
              </ul>
            </div>
          )}

          <div className="bg-[#151515] rounded-2xl border border-white/10 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">Nudges</div>
            <div className="flex flex-wrap gap-2">
              {[
                "Add a metric",
                "Name the tool or stack",
                "Tie to role impact",
                "Mention collaboration",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleNudge(prompt)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300 hover:bg-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <button
          onClick={handleSkip}
          disabled={!isActive}
          className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] hover:bg-[#262626] text-gray-400 hover:text-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4" />
          Skip Question
        </button>

        <button
          onClick={handleSubmit}
          disabled={!isActive || !answer.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {questionNumber === totalQuestions ? "Finish Interview" : "Next Question"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  
  )
}

export default InterviewQuestions