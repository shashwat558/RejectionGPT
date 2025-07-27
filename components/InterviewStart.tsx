"use client"

import { Play, Clock, FileText, Target } from "lucide-react"

interface InterviewStartProps {
  onStart: () => void
}

export default function InterviewStart({ onStart }: InterviewStartProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl bg-[#252525] rounded-xl border border-[#383838] p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-gray-200 mb-4">Interview Practice Session</h1>
        <p className="text-gray-400 text-lg mb-8">
          Practice your interview skills with 10 common interview questions. Each question has a 1-minute time limit.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 mx-auto mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-gray-300 font-medium mb-1">10 Questions</h3>
            <p className="text-gray-500 text-sm">Common interview questions across different categories</p>
          </div>

          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 mx-auto mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-gray-300 font-medium mb-1">1 Minute Each</h3>
            <p className="text-gray-500 text-sm">Practice answering within realistic time constraints</p>
          </div>

          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 text-green-400 mx-auto mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-gray-300 font-medium mb-1">Instant Feedback</h3>
            <p className="text-gray-500 text-sm">Review your answers and get tips for improvement</p>
          </div>
        </div>

        <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4 mb-8">
          <h3 className="text-gray-300 font-medium mb-2">Tips for Success:</h3>
          <ul className="text-gray-400 text-sm space-y-1 text-left">
            <li>• Be concise and specific in your answers</li>
            <li>• Use the STAR method (Situation, Task, Action, Result) for behavioral questions</li>
            <li>• Practice speaking clearly and confidently</li>
            <li>• Don&apos;t worry if you don&apos;t finish - focus on quality over quantity</li>
          </ul>
        </div>

        <button
          onClick={onStart}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <Play className="w-5 h-5" />
          Start Interview Practice
        </button>
      </div>
    </div>
  )
}