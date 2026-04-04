"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Zap,
  Target,
  MessageSquare
} from "lucide-react";

export default function FeaturesBentoGrid() {
  return (
    <section className="w-full bg-[#F9FAFB] py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col mb-16 space-y-4 text-center md:text-left">
          <h2 className="text-4xl md:text-6xl font-bold text-black tracking-tight leading-[1.1]">
            Everything you need to <br /><span className="text-gray-400">ace the interview</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
            Stop guessing. Use data-driven insights to optimize your resume and master the recruitment process.
          </p>
        </div>

        {/* Bento Grid — mirrors the image layout:
            Row 1: [Wide card spanning 8 cols] + [Tall card spanning 4 cols, rowspan 2]
            Row 2: [Card 4 cols] + [Card 4 cols]
        */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-[auto_auto] gap-6">

          {/* ── Card 1: Deep Analysis — top-left wide (col 1–8) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-8 md:row-span-1 bg-white rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative border border-gray-100 shadow-sm group hover:shadow-md transition-shadow min-h-[260px]"
          >
            <div className="max-w-md relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
                Deep Analysis
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Get an instant score on how well your resume matches the job description, built by reverse-engineering ATS systems.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-xs font-bold text-gray-500 tracking-wide uppercase">Trusted by 10k+ professionals</div>
              </div>
            </div>

            {/* Floating cards visual */}
            <div className="absolute right-0 top-0 w-1/2 h-full hidden md:block pointer-events-none">
              <div className="relative w-full h-full">
                <div className="absolute top-[20%] right-[10%] w-56 h-36 bg-zinc-900 rounded-2xl shadow-2xl rotate-[12deg] z-30 p-5 flex flex-col justify-between border border-white/10 group-hover:rotate-[15deg] transition-transform duration-500">
                  <div className="flex justify-between items-start">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-xs">ATS</div>
                    <div className="text-white/40 text-[9px] font-mono tracking-widest uppercase">Analysis</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">94% Match</div>
                    <div className="text-white/60 text-xs">Based on 124 parameters</div>
                  </div>
                </div>
                <div className="absolute top-[35%] right-[28%] w-56 h-36 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl rotate-[-5deg] z-20 p-5 flex flex-col justify-between border border-white/10 group-hover:rotate-[-8deg] transition-transform duration-500">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">Senior Engineer</div>
                    <div className="text-white/60 text-xs">Optimized for Google, Meta</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Card 4: AI Mock Interview — right tall (col 9–12, rows 1–2) ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-4 md:row-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col overflow-hidden relative group"
          >
            <div className="relative z-10 mb-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-4">
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                AI Powered
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
                A personal interview coach
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Say goodbye to generic advice. Our AI reads your resume and the job description to mock-interview you like a real hiring manager.
              </p>
            </div>

            {/* Phone Mockup */}
            <div className="relative w-full max-w-[220px] mx-auto mt-auto flex-1 flex items-end group-hover:-translate-y-3 transition-transform duration-700">
              <div className="w-full bg-black rounded-[3rem] p-2.5 shadow-2xl border-[5px] border-zinc-800">
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full z-20" />
                <div className="w-full bg-zinc-900 rounded-[2.2rem] overflow-hidden p-4 pt-9">
                  <div className="flex justify-between items-center mb-5">
                    <div className="text-white text-xs font-bold">Interview Session</div>
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-2xl rounded-tl-sm p-2.5 text-[10px] text-white/90">
                      &ldquo;Tell me about a time you handled a tight deadline with a difficult stakeholder.&rdquo;
                    </div>
                    <div className="bg-blue-600 rounded-2xl rounded-tr-sm p-2.5 text-[10px] text-white ml-auto max-w-[85%] shadow-lg shadow-blue-600/20">
                      &ldquo;In my last project at Meta, I had to balance a major feature launch...&rdquo;
                    </div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-sm p-2.5 text-[10px] text-white/90">
                      &ldquo;Excellent. How did you specifically manage the difficult aspect?&rdquo;
                    </div>
                  </div>
                  <div className="mt-4 bg-zinc-800/80 rounded-2xl p-3 border border-white/10">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="text-[9px] font-bold text-white/40 uppercase">Session Score</div>
                      <div className="text-[10px] font-bold text-green-400">8.4/10</div>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "84%" }}
                        className="h-full bg-green-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Card 2: ATS Insights — bottom-left (col 1–4) ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-4 md:row-span-1 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden relative group"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xl font-bold text-black mb-1">ATS Insights</h4>
                <p className="text-gray-500 text-sm italic">Reverse-engineered accuracy</p>
              </div>
              <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                LIVE
              </div>
            </div>
            <div className="flex items-end justify-between gap-2 h-28">
              {[45, 65, 85, 95, 75, 55, 90].map((height, i) => (
                <div key={i} className="flex-1 relative flex flex-col justify-end h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${i === 3 ? "bg-black" : "bg-gray-100 hover:bg-gray-200"}`}
                  />
                  {i === 3 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] py-1 px-2 rounded-lg whitespace-nowrap z-20">
                      95%
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-50 text-[9px] font-bold text-gray-400 tracking-widest">
              <div>STRUCT</div>
              <div>KEYS</div>
              <div>FORMAT</div>
              <div>EXP</div>
            </div>
          </motion.div>

          {/* ── Card 3: Natural Language to PDF — bottom-right (col 5–8) ── */}
          <Link href="/builder" className="block outline-none md:col-span-4 md:row-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden relative group cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-xl font-bold text-black mb-1 group-hover:text-orange-600 transition-colors">Natural Language to PDF</h3>
                  <p className="text-gray-500 text-sm">Update your resume just by talking to our AI.</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative">
                <div className="absolute -top-3 left-5 bg-black text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg z-10 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-yellow-400" /> Live Render
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-2.5 shadow-sm">
                      <p className="text-[10px] text-gray-700">Add &apos;RejectionGPT&apos; — AI interviewer built with Next.js.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="w-full bg-[#1e1e1e] rounded-2xl rounded-tl-sm p-2.5 overflow-hidden">
                      <div className="flex justify-between items-center mb-1.5 border-b border-gray-700 pb-1.5">
                        <span className="text-[9px] text-gray-400 font-mono">resume.tex</span>
                        <span className="text-[9px] text-green-400 font-bold">Updated</span>
                      </div>
                      <pre className="text-[9px] font-mono text-gray-300 leading-relaxed">
                        <span className="text-pink-400">\cvproject</span>&#123;<span className="text-yellow-300">RejectionGPT</span>&#125;
                        {"\n"}<span className="text-green-400 bg-green-400/10 block border-l-2 border-green-500 pl-1">\item Built AI interviewer...</span>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

        </div>
      </div>
    </section>
  );
}