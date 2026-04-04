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
        if(timeLeft > 30) return "text-green-600 font-medium"
        if(timeLeft > 10) return "text-yellow-600 font-medium"
        return "text-red-600 font-bold"
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
    <div className="flex flex-col min-h-screen py-8 max-w-6xl mx-auto">
      
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm font-medium">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="text-xs text-black border border-gray-200 bg-gray-50 rounded-full px-2 py-1 font-medium">Focus mode</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-black bg-white hover:bg-gray-50 shadow-sm transition-colors"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {isPaused ? "Resume" : "Pause"}
            </button>

            <div className={`flex items-center gap-2 ${getTimeColor()} bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100`}>
              <Clock className="w-5 h-5" />
              <span className="text-lg font-mono font-bold tracking-tight">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeLeft > 30 ? "bg-black" : timeLeft > 10 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: getTimePassingWidth() }}
          ></div>
        </div>

        {/* Overall Progress */}
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>
            Progress: {questionNumber}/{totalQuestions}
          </span>
          <span>{Math.round(((questionNumber - 1) / totalQuestions) * 100)}% Complete</span>
        </div>
      </div>

     

    
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-6 flex-1">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold tracking-tight text-black mb-8 leading-snug">{question.question_text}</h2>

          <div className="space-y-4">
            <div className='flex gap-5 items-center justify-between w-full'>
              <label className="block text-gray-500 text-sm font-bold uppercase tracking-wider">Your Answer:</label>
              <div className='flex items-center gap-3'>
                {listening && (<h2 className='text-sm font-medium text-black animate-pulse'>Listening...</h2>)}
                <div className='p-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-colors cursor-pointer'>
                
                {listening ? <MicOff onClick={stopListening} className={`text-red-500 size-5`} />:
                
                <Mic onClick={startListening} className={`text-black size-5`} />
              }

              </div>
              </div>
            </div>
            
            <textarea
              ref={textAreaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here... Be specific and provide examples when possible."
              className="w-full h-64 p-5 bg-gray-50 border border-gray-200 rounded-xl text-black text-base placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-inner"
              disabled={!isActive}
            />
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>{answer.length} characters</span>
              <span>{words} words</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-black uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-black" />
                Interview Coach
              </div>
              <button
                onClick={() => setShowStarHelper((prev) => !prev)}
                className="text-xs font-semibold text-gray-400 hover:text-black transition-colors"
              >
                {showStarHelper ? "HIDE STAR" : "SHOW STAR"}
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 font-medium text-sm text-black shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-black"></div>
                {getCoachHint()}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-500 font-medium shadow-sm flex flex-col gap-1">
                  Pace <span className="text-black font-bold text-sm tracking-tight">{wordsPerMinute} wpm</span>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-500 font-medium shadow-sm flex flex-col gap-1">
                  Energy <span className="text-black font-bold text-sm tracking-tight capitalize">{timeLeft > 30 ? "Steady" : "Urgent"}</span>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-500 font-medium shadow-sm flex flex-col gap-1">
                  Focus <span className="text-black font-bold text-sm tracking-tight capitalize">{isPaused ? "Paused" : "Live"}</span>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-500 font-medium shadow-sm flex flex-col gap-1">
                  Voice <span className="text-black font-bold text-sm tracking-tight capitalize">{listening ? "Listening" : "Ready"}</span>
                </div>
              </div>
            </div>
          </div>

          {showStarHelper && (
            <div className="bg-black rounded-2xl border border-black p-6 text-sm text-white shadow-xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-4 font-bold uppercase tracking-wider text-xs">
                <Zap className="w-4 h-4 text-white" />
                STAR framework
              </div>
              <ul className="space-y-3 leading-relaxed">
                <li><strong className="text-white">Situation</strong>: Set context in one line.</li>
                <li><strong className="text-white">Task</strong>: Clarify your responsibility.</li>
                <li><strong className="text-white">Action</strong>: 2 to 3 concrete steps you took.</li>
                <li><strong className="text-white">Result</strong>: Measurable impact or lesson.</li>
              </ul>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Nudges</div>
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
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-black bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-auto pt-6 border-t border-gray-200">
        <button
          onClick={handleSkip}
          disabled={!isActive}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-black font-medium rounded-xl transition-all disabled:opacity-50 disabled:bg-gray-100 shadow-sm"
        >
          <SkipForward className="w-4 h-4" />
          Skip Question
        </button>

        <button
          onClick={handleSubmit}
          disabled={!isActive || !answer.trim()}
          className="flex items-center gap-2 px-8 py-3 bg-black text-white hover:bg-gray-800 font-bold tracking-wide rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {questionNumber === totalQuestions ? "Finish Interview" : "Next Question"}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  
  )
}

export default InterviewQuestions