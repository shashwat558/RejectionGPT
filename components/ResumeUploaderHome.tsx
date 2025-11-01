/* eslint-disable react/no-unescaped-entities */
"use client";
import React, {useRef, useState } from 'react'
import { motion, useScroll} from "framer-motion";
import { useRouter } from 'next/navigation';
import { CheckCircle, FileText, Briefcase, Star, Coffee, Zap } from 'lucide-react';
import { useAuth } from '@/stores/useAuth';
import Image from 'next/image';
const ResumeUploaderHome = () => {
    const [resume, setResume] = useState<File | null>(null);
    const [jobDesc, setJobDesc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()
    const {user} = useAuth();
    const ref = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [videoPlaying, setVideoPlaying] = useState(true);
    const {scrollYProgress} = useScroll({

        container: containerRef,
        target: ref,
        axis: "y",
        offset: ["start end", "center center"]

    });
    

   

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user){
            router.push("/login")
        }
        if (!resume) return;

        try {
            setIsLoading(true);

            const data = new FormData();
            data.set("resume", resume);
            data.set("jobDesc", jobDesc || "");

            const response = await fetch("/api/analyzer", {
            method: "POST",
            body: data,
            });

            setIsLoading(false);

            if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
            }

            const result = await response.json();
            const analysisId = result.analysisId;

            if (!analysisId) throw new Error("Missing analysisId in response");

            router.push(`/analytics/${analysisId}`);
        } catch (error) {
            console.error("Error during analysis upload:", error);
            setIsLoading(false);
        }
};

    

        




        

    return (
        <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className='w-full flex flex-col justify-center items-center mt-10 p-2'
        >
            
            
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#303030]/20 to-transparent pointer-events-none" />

            <div className='xl:w-2/3 w-full p-8 flex justify-center items-center rounded-lg border-t-3 border-[#383838] bg-[#252525] shadow-xl relative z-10'>
                <div className='flex w-full flex-col md:flex-row justify-between items-center gap-8 px-3'>
                    <div className='flex flex-1 flex-col justify-center items-start gap-6 max-w-xl'>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#333] text-gray-300 text-xs font-medium mb-2">
                            <Coffee className="w-4 h-4 mr-1 text-yellow-400" />
                            <span>Cheaper than a career coach&apos;s coffee</span>
                        </div>
                        
                        <h1 className='text-4xl md:text-5xl text-gray-300 font-[900] leading-tight'>
                            Beat the robots. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">Before they beat you.</span>
                        </h1>
                        
                        <p className='text-xl text-gray-500 leading-relaxed'>
                            Upload your resume and watch our AI outsmart their AI. Because nothing says &quot;hire me&quot; like gaming the system with another system.
                        </p>

                        
                        <div className="flex flex-col gap-3 mt-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-400">Buzzword optimization (because &quot;synergy&quot; still works)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-400">ATS-whispering (we speak robot so you don&apos;t have to)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-400">Resume CPR when yours is flatlining</span>
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-1 flex-col justify-center items-center gap-6 w-full max-w-md'>
                        <h2 className="text-lg font-semibold text-gray-400 mb-4 flex items-center gap-2">
                            <span className="h-[1px] flex-1 bg-gray-700" />
                            Your Ticket to Interview Purgatory
                            <span className="h-[1px] flex-1 bg-gray-700" />
                        </h2>

                        
                        <div className="flex w-full justify-between mb-4">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-gray-300 font-medium">1</div>
                                <span className="text-xs text-gray-500 mt-1">Upload</span>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <div className="h-[2px] w-full bg-[#333] mb-5"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-gray-300 font-medium">2</div>
                                <span className="text-xs text-gray-500 mt-1">Magic</span>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <div className="h-[2px] w-full bg-[#333] mb-5"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-gray-300 font-medium">3</div>
                                <span className="text-xs text-gray-500 mt-1">Profit?</span>
                            </div>
                        </div>

                        <div className='relative w-full h-72 border-dashed border-2 border-[#424141] rounded-xl flex flex-col items-center justify-center p-6 hover:border-[#555] transition-colors group'>
                            <div className="absolute inset-0 bg-[#2a2a2a] opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                            
                            <FileText 
                                className="w-12 h-12 mb-4 text-gray-400 group-hover:text-gray-300 transition-colors" 
                            />
                            <p className='text-gray-400 text-center mb-2 group-hover:text-gray-300 transition-colors'>Drop your resume here (the one you&apos;ve rewritten 47 times)</p>
                            <p className='text-gray-500 text-sm'>or click to browse (we accept PDF, DOC, DOCX, and tears)</p>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                                onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
                                
                                required
                            />
                            {resume && (
                                <div className="text-sm text-gray-400 mt-2 text-center">
                                    <div className="flex items-center gap-2 bg-[#333] px-3 py-1 rounded-full">
                                        <FileText className="w-4 h-4" />
                                        {resume.name}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setResume(null);
                                            }}
                                            className="ml-2 text-red-400 hover:text-red-500 text-xs"
                                        >
                                            (regrets)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative w-full">
                            <div className="absolute top-5 left-3">
                                <Briefcase className="w-5 h-5 text-gray-500" />
                            </div>
                            <textarea
                                placeholder='Paste that impossibly demanding job description here...'
                                className='w-full h-32 p-4 pl-10 rounded-lg bg-[#303030] text-gray-300 placeholder-gray-500 border border-[#424141] focus:outline-none focus:ring-2 focus:ring-[#555] resize-none'
                                onChange={(e) => setJobDesc(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        
                        <motion.button
                            
                            whileHover={{
                                scale: 1.03,
                                backgroundColor: "#555",
                            }}
                            disabled={isLoading}
                            whileTap={{ scale: 0.98 }}
                            className='w-full py-3 px-6 bg-[#424141] text-gray-300 font-medium rounded-lg transition-colors duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2'
                            onClick={handleSubmit}
                        >
                            {isLoading ? (
                                <div className="relative flex items-center justify-center">
                                    <div className='w-6 h-6 border-2 border-gray-900 border-t-gray-600 rounded-full animate-spin'
                                        style={{ animationDuration: '0.8s' }} />
                                </div>
                            ) : (
                                <>
                                    Make Me Employable <Zap className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }} className='xl:w-2/3 w-full mt-10 flex flex-col justify-center items-center rounded-lg border-t-3 border-[#383838] bg-[#252525] shadow-xl relative z-10' ref={containerRef}>
                <div className={`absolute top-0 left-[98%] flex flex-col items-center justify-center transition-opacity duration-300 ${!videoPlaying ? 'opacity-100' : 'opacity-0'}`}>
                    <h3 className='text-white text-md ml-3 bg-[#505050] p-1 rounded-lg'>How to use</h3>
                    <svg
                        className=" transform scale-x-[-1] scale-y-[-1]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                        viewBox="-10 -20 100 125"
                        height={100}
                        width={100}
                        x="0px"
                        y="0px"
                        >
                        <title>Artboard 20</title>

                        <g data-name="Layer 32">
                            <path d="M21.8,84.93C17.17,73.18,18.3,57.49,31,51.23c5.9-2.92,13.64-2.24,18.55,2.32,3.81,3.54,4,9.65-1.5,11.39a12.56,12.56,0,0,1-11.27-2.37C24.87,53,35.34,37.29,45.69,32c12-6.15,26.47-5.58,38.32.5,1.72.88,3.24-1.71,1.52-2.59-12.85-6.59-28.39-7.17-41.36-.5C33.6,34.83,24.86,47,30.31,59.07a15.82,15.82,0,0,0,13.12,9.25c4.56.38,10.38-1.4,12-6.18,1.89-5.46-2.94-10.83-7.38-13.28a20,20,0,0,0-16.28-1.22C16.2,53.3,13.49,72,18.91,85.73c.7,1.77,3.6,1,2.89-.8Z" />
                            <path d="M74.83,20.92A134.38,134.38,0,0,1,86,32l.31-2.35a105.47,105.47,0,0,0-15.66,9.91c-1.51,1.16,0,3.77,1.52,2.59a104.86,104.86,0,0,1,15.65-9.91,1.52,1.52,0,0,0,.31-2.36A134.48,134.48,0,0,0,77,18.8c-1.44-1.27-3.58.85-2.12,2.12Z" />
                        </g>
                        </svg>

                </div>
             
             
                <video style={{ scale: scrollYProgress }} autoPlay preload='auto' controls loop muted src="kanye.mp4" className='w-full h-full object-cover rounded-xl' ref={ref} onPlay={() => setVideoPlaying(true)} onPause={() => setVideoPlaying(false)} />
             
            </motion.div>

            
            <div className="mt-8 w-full xl:w-2/3 px-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="bg-[#252525] p-4 rounded-lg border border-[#383838] flex-1">
                        <div className="flex items-center gap-1 text-yellow-400 mb-2">
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                        <p className="text-gray-400 text-sm">"After using this tool, I got callbacks from 3 companies that had previously ghosted me. Turns out my resume needed more buzzwords than a corporate bingo card."</p>
                        <p className="text-gray-500 text-xs mt-2">— Michael K., Professional Keyword Stuffer</p>
                    </div>
                    <div className="bg-[#252525] p-4 rounded-lg border border-[#383838] flex-1">
                        <div className="flex items-center gap-1 text-yellow-400 mb-2">
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                        <p className="text-gray-400 text-sm">"The ATS compatibility check saved my application. Apparently, fancy fonts and creative layouts are resume suicide. Who knew robots were such design critics?"</p>
                        <p className="text-gray-500 text-xs mt-2">— Sarah L., Reformed Font Enthusiast</p>
                    </div>
                    <div className="bg-[#252525] p-4 rounded-lg border border-[#383838] flex-1">
                        <div className="flex items-center gap-1 text-yellow-400 mb-2">
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                        <p className="text-gray-400 text-sm">"I landed my dream job after using this tool. Now I just need another tool to help me actually do all those things I claimed I could do on my resume."</p>
                        <p className="text-gray-500 text-xs mt-2">— Alex T., Professional Fake-it-till-you-make-it-er</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default ResumeUploaderHome