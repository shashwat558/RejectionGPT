"use client"

import { Play, Clock, FileText, Mic, Sparkles } from "lucide-react"

interface InterviewStartProps {
  onStart: () => void
}

export default function InterviewStart({ onStart }: InterviewStartProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-4xl bg-[#151515] rounded-2xl border border-white/10 p-8 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">
              <Sparkles className="w-3.5 h-3.5" />
              Practice arena
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-gray-100">Interview Practice Session</h1>
            <p className="mt-3 text-gray-400 text-base md:text-lg">
              Simulate a focused interview with time pressure, live coaching prompts, and voice input.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Session</p>
              <p className="text-2xl font-semibold text-gray-100">10 Qs</p>
              <p className="text-xs text-gray-500">90 sec each</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-gray-200 mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-gray-200 font-medium mb-1">Structured questions</h3>
            <p className="text-gray-500 text-sm">Behavioral, technical, and scenario prompts</p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-gray-200 mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-gray-200 font-medium mb-1">Timed rounds</h3>
            <p className="text-gray-500 text-sm">Practice clarity under pressure</p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-gray-200 mb-3">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-gray-200 font-medium mb-1">Voice + text</h3>
            <p className="text-gray-500 text-sm">Switch between speaking and typing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-black/40 border border-white/10 rounded-xl p-5">
            <h3 className="text-gray-200 font-medium mb-3">Session settings</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>• Auto-advance when time hits zero</li>
              <li>• Live pacing meter with tips</li>
              <li>• STAR cheat sheet always available</li>
              <li>• Keyboard shortcuts for power users</li>
            </ul>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-xl p-5">
            <h3 className="text-gray-200 font-medium mb-3">Warm-up prompt</h3>
            <p className="text-gray-400 text-sm">
              In one sentence, describe the impact you are most proud of. You will reuse it later.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500">Tip: press Ctrl+Enter to submit, Ctrl+P to pause.</div>
          <button
            onClick={onStart}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black hover:bg-gray-200 font-medium rounded-xl transition-all duration-200"
          >
            <Play className="w-5 h-5" />
            Start Interview Practice
          </button>
        </div>
      </div>
    </div>
  )
}