"use client";

import Image from "next/image";
import { useState } from "react";

export default function FeaturesBentoGrid() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-10">
      <div className="mb-6 md:mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
          Powerful Features
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Everything you need to land your dream job
        </p>
      </div>

      <div className="w-full p-3 sm:p-4 md:p-3 flex flex-col md:flex-row gap-4 md:gap-0 bg-[#1a1919] border border-[#383838] rounded-lg">
      
        <div className="w-full md:w-1/3 md:h-[700px] flex flex-col justify-between items-center gap-4 md:gap-5 p-2 md:p-2">
          <div className="w-full bg-[radial-gradient(circle_at_top_left,#4d4d4d,#171717)] rounded-lg border border-[#383838] md:h-[48%]">
            <div className="w-full h-full flex flex-col justify-center items-center gap-3 md:gap-4 p-4 sm:p-5 md:p-5 text-center">
              <h3 className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-semibold text-white mb-1">
                Resume Analysis
              </h3>
              <p className="text-gray-400 text-sm sm:text-base md:text-sm lg:text-base leading-relaxed px-1">
                Get your resume analyzed against any job description. Receive a
                detailed compatibility score and AI-powered suggestions to stand
                out to recruiters.
              </p>
            </div>
          </div>

          <div className="w-full md:h-[48%] flex flex-col justify-between items-center gap-3 md:gap-3 rounded-lg">
            <div className="w-full bg-[radial-gradient(circle_at_bottom_center,#575757,#181818)] rounded-lg border border-[#383838] md:h-[65%]">
              <div className="w-full h-full flex flex-col justify-center items-center gap-2 md:gap-3 p-4 sm:p-5 md:p-5 text-center">
                <h3 className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-semibold text-white mb-1">
                  Mock Interview Assistant
                </h3>
                <p className="text-gray-400 text-sm sm:text-base md:text-sm lg:text-base leading-relaxed">
                  Simulate real-world interviews with personalized questions.
                </p>
              </div>
            </div>

            <div className="w-full bg-[radial-gradient(circle_at_bottom_center,#5a5a5a,#181818)] rounded-lg border border-[#383838] md:h-[32%]">
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 md:gap-2 text-center p-3 sm:p-4 md:p-3">
                <h3 className="text-lg sm:text-xl md:text-lg lg:text-xl font-semibold text-white mb-1">
                  Skill Tracker
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm px-2">
                  Track your skills and progress with personalized learning paths.
                </p>
              </div>
            </div>
          </div>
        </div>

       
        <div className="w-full md:w-1/2 md:h-[700px] relative flex flex-col p-2 justify-between items-center gap-4 md:gap-3">
          <div className="w-full bg-[radial-gradient(circle_at_bottom_center,#5b5050,#241e1e)] rounded-lg border border-[#383838] md:h-[48%] p-5 sm:p-6 md:p-5 text-center">
            <div className="w-full h-full flex flex-col justify-center items-center gap-3 md:gap-3">
              <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-semibold text-gray-300 uppercase tracking-wider mb-1">
                RejectionGPT
              </h3>
              <h1 className="text-2xl sm:text-3xl md:text-2xl lg:text-4xl xl:text-5xl font-extrabold text-white leading-tight">
                Let&apos;s Get You Hired
              </h1>
              <p className="text-gray-400 text-sm sm:text-base md:text-sm lg:text-base max-w-md mt-2 leading-relaxed">
                Turn rejections into learning — get feedback, tips, and a
                confidence boost from your personal AI coach.
              </p>
            </div>
          </div>

          <div className="w-full md:h-[48%] flex flex-col sm:flex-row justify-between items-stretch gap-3 md:gap-3 rounded-lg">
            <div className="w-full sm:w-1/2 md:h-full bg-[radial-gradient(circle_at_top_right,#606060,#141414)] rounded-lg border border-[#383838] p-4 sm:p-3 text-center flex flex-col items-center justify-center">
              <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold text-white mb-2">
                Multiturn Chatbot
              </h3>
              <p className="text-gray-400 text-sm sm:text-base md:text-sm lg:text-base leading-relaxed">
                A smart conversation partner that remembers context and performs
                live web searches to keep responses fresh and accurate.
              </p>
            </div>
            <div className="w-full sm:w-1/2 md:h-full bg-[radial-gradient(circle_at_top_left,#666,#181818)] rounded-lg border border-[#383838] flex items-center justify-center text-gray-400 text-base sm:text-lg md:text-base font-semibold p-4">
              Coming Soon
            </div>
          </div>

          <div className="hidden md:flex absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 items-center justify-center bg-[#1A1919] rounded-[40px] pointer-events-none">
            <div className="border-gray-600 w-[80%] h-[80%] rounded-[25px] border-[1px] p-[1px]">                  
            <div className="bg-[#222121] w-full h-full rounded-[25px] border-[1px] border-[#383838] border-t-2 border-l-2 border-r-2">
                <Image src="/logo.svg" alt="success" width={500} height={500} className="w-full h-full object-cover" />
            </div> 
            </div>                   
          </div>
        </div>
        <div className="w-full md:w-1/3 md:h-[700px] flex flex-col md:flex-col-reverse justify-between items-center gap-4 md:gap-3 p-2 md:p-2">
          <div className="w-full bg-[radial-gradient(circle_at_bottom_right,#4e4e4e,#181818)] rounded-lg border border-[#383838] md:h-[48%] flex flex-col justify-center items-center text-center p-4 sm:p-5 md:p-4">
            <h3 className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-semibold text-white mb-2">
              Resume-based AI Chat Assistant
            </h3>
            <p className="text-gray-400 text-sm sm:text-base md:text-sm lg:text-base leading-relaxed">
              Chat with your own resume. Ask about strengths, weaknesses, and suggestions directly powered by AI. 
            </p>
          </div>

          <div className="w-full md:h-[48%] flex flex-col justify-between items-center gap-3 md:gap-3">
            <div className="w-full bg-[radial-gradient(circle_at_bottom_center,#595959,#1b1b1b)] rounded-lg border border-[#383838] md:h-[35%]">
              <div className="w-full h-full flex flex-col sm:flex-row justify-around items-center p-3 sm:p-4 md:p-3 gap-3 sm:gap-2">
                <p className="text-white text-base sm:text-lg md:text-base lg:text-lg font-semibold">
                  Enable Success
                </p>
                <div
                  onClick={() => setEnabled(!enabled)}
                  className={`relative w-24 sm:w-28 md:w-24 h-12 sm:h-14 md:h-12 rounded-full cursor-pointer transition-all duration-300 ${
                    enabled
                      ? "bg-gradient-to-r from-[#3a2b5e] to-[#1b1830]"
                      : "bg-gradient-to-r from-[#1b1830] to-[#0f0f1a]"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 h-10 w-10 sm:h-12 sm:w-12 md:h-10 md:w-10 rounded-full transition-all duration-300 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] ${
                      enabled
                        ? "translate-x-12 sm:translate-x-14 md:translate-x-12 bg-gradient-to-br from-[#ffb169] to-[#ff8653]"
                        : "translate-x-0 bg-gradient-to-br from-[#3a3a3a] to-[#222]"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="white"
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m12.02-6.36l-.7.7m-6.62 6.62l-.7.7m9.9 0l-.7-.7m-6.62-6.62l-.7-.7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full bg-[radial-gradient(circle_at_bottom_center,#5a5a5a,#1a1a1a)] rounded-lg border border-[#383838] md:h-[62%] p-4 sm:p-5 md:p-5 text-center">
              <h3 className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-semibold text-white mb-2">
                DSA Problem Recommender
              </h3>
              <p className="text-gray-400 text-sm sm:text-base md:text-sm lg:text-base leading-relaxed">
                Get custom DSA challenges based on your resume&apos;s experience
                level and target role to sharpen your technical edge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
