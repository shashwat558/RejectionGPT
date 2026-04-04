"use client"

import { Play, Clock, FileText, Mic, Sparkles } from "lucide-react"

interface InterviewStartProps {
  onStart: () => void
}

export default function InterviewStart({ onStart }: InterviewStartProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50/30">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-gray-200 p-8 md:p-10 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-black shadow-sm tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              Practice Arena
            </div>
            <h1 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight text-black">Interview Practice Session</h1>
            <p className="mt-3 text-gray-500 text-base md:text-lg max-w-lg leading-relaxed">
              Simulate a focused interview with time pressure, live coaching prompts, and voice input.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
              <FileText className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Session</p>
              <p className="text-xl font-bold text-black tracking-tight">10 Qs</p>
              <p className="text-xs font-medium text-gray-500">90 sec each</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-colors rounded-xl p-5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-100 text-black mb-4 group-hover:bg-black group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-black font-semibold mb-1.5">Structured questions</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Behavioral, technical, and scenario prompts</p>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-colors rounded-xl p-5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-100 text-black mb-4 group-hover:bg-black group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-black font-semibold mb-1.5">Timed rounds</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Practice clarity under pressure</p>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-colors rounded-xl p-5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-100 text-black mb-4 group-hover:bg-black group-hover:text-white transition-colors">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-black font-semibold mb-1.5">Voice + text</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Switch between speaking and typing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
            <h3 className="text-black font-semibold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              Session settings
            </h3>
            <ul className="text-gray-600 text-sm space-y-2.5 font-medium">
              <li className="flex items-center gap-2">Auto-advance when time hits zero</li>
              <li className="flex items-center gap-2">Live pacing meter with tips</li>
              <li className="flex items-center gap-2">STAR cheat sheet always available</li>
              <li className="flex items-center gap-2">Keyboard shortcuts for power users</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 relative z-10">
              <Sparkles className="w-4 h-4 text-white" />
              Warm-up prompt
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed relative z-10 font-medium">
              In one sentence, describe the impact you are most proud of. Keep this in mind, you will reuse it later.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 px-3 py-1.5 rounded border border-gray-100">
            Tip: press Ctrl+Enter to submit, Ctrl+P to pause.
          </div>
          <button
            onClick={onStart}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-black text-white hover:bg-gray-800 font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group"
          >
            Start Interview Practice
            <Play className="w-5 h-5 fill-white" />
          </button>
        </div>
      </div>
    </div>
  )
}