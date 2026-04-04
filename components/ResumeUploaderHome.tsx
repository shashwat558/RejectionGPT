
"use client";
import React, { useState } from 'react'
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { CheckCircle, FileText, Briefcase, Star, Zap } from 'lucide-react';
import { useAuth } from '@/stores/useAuth';
import LoadingButton from '@/components/ui/loading-button';
import ErrorState from '@/components/ui/error-state';
import { uploadAndAnalyze } from '@/lib/services/resume.client';
import Image from 'next/image';

const ResumeUploaderHome = () => {
    const [resume, setResume] = useState<File | null>(null);
    const [jobDesc, setJobDesc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter()
    const { user } = useAuth();
    // const ref = useRef<HTMLVideoElement>(null);
    // const containerRef = useRef<HTMLDivElement>(null);
    // const [videoPlaying, setVideoPlaying] = useState(true);





    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push("/login")
            return
        }
        if (!resume) return;
        setErrorMessage(null);

        try {
            setIsLoading(true);
            const { analysisId } = await uploadAndAnalyze(resume, jobDesc || "")
            router.push(`/analytics/${analysisId}`);
        } catch (error) {
            console.error("Error during analysis upload:", error);
            setErrorMessage("We could not process your resume. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };










    return (
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24 mb-10'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='flex flex-col justify-center items-center text-center space-y-6 max-w-4xl mx-auto'
            >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer pr-4">
                    <span className="flex h-2 w-2 rounded-full bg-black"></span>
                    Now it is time to get hired <span className="ml-1">→</span>
                </div>

                {/* Main Heading */}
                <h1 className='text-5xl md:text-7xl font-bold text-black tracking-tight leading-[1.1]'>
                    Your all-in-one learning platform <span className="font-serif italic font-light text-gray-500">effective</span>
                </h1>

                {/* Subheading */}
                <p className='text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed'>
                    Preparing for exams is already challenging enough. Avoid further complications by ditching outdated study methods. Upload your resume and job description to get started.
                </p>

                {/* Trust Signals */}
                <div className="flex items-center gap-4 pt-4">
                    <div className="flex -space-x-3">
                        <Image width={100} height={100} className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=1" alt="User 1" />
                        <Image width={100} height={100} className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=2" alt="User 2" />
                        <Image width={100} height={100} className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=3" alt="User 3" />
                        <Image width={100} height={100} className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=4" alt="User 4" />
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">+99</div>
                    </div>
                    <div className="flex flex-col items-start">
                        <div className="flex items-center text-black">
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 mt-0.5">Trusted by 1000+ users</span>
                    </div>
                </div>
            </motion.div>

            {/* Upload Area */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className='mt-16 bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden'
            >
                <div className='flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200'>
                    {/* Resume Upload Column */}
                    <div className='flex-1 p-8 md:p-12 hover:bg-gray-50/50 transition-colors'>
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-black">1. Upload Resume</h3>
                                <p className="text-sm text-gray-500 mt-1">PDF or DOCX format</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>

                        <div className='relative w-full h-48 border-2 border-dashed border-black rounded-xl flex flex-col items-center justify-center p-6 bg-white hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group overflow-hidden'>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                                onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
                                required
                            />

                            {!resume ? (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <FileText className="w-6 h-6 text-gray-600 group-hover:text-black transition-colors" />
                                    </div>
                                    <p className='text-sm font-medium text-black mb-1 group-hover:text-black transition-colors'>Click or drag to upload</p>
                                    <p className='text-xs text-gray-500 text-center max-w-[200px]'>SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-center z-20">
                                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <p className="text-sm font-medium text-black truncate max-w-[200px]">{resume.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">Ready to process</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setResume(null);
                                        }}
                                        className="mt-3 text-red-500 hover:text-red-700 text-xs font-medium cursor-pointer relative z-30"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Job Description Column */}
                    <div className='flex-1 p-8 md:p-12 bg-gray-50/30'>
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-black">2. Job Details</h3>
                                <p className="text-sm text-gray-500 mt-1">Paste the requirements</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                <Briefcase className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="relative w-full h-48">
                            <textarea
                                placeholder='Paste the job description here to analyze alignment...'
                                className='w-full h-full p-5 rounded-xl bg-white border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] resize-none transition-shadow'
                                onChange={(e) => setJobDesc(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 md:px-12 md:py-8 bg-white border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-black font-bold">Both fields are required to begin</p>
                    <motion.div whileHover={{ scale: 1 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                        <LoadingButton
                            isLoading={isLoading}
                            loadingText="Analyzing alignment..."
                            className="w-full sm:w-auto py-3 px-8 bg-white border-2 border-black text-black font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            onClick={handleSubmit}
                            disabled={!resume || !jobDesc}
                        >
                            Analyze Now <Zap className="w-4 h-4 ml-2" />
                        </LoadingButton>
                    </motion.div>
                </div>
            </motion.div>

            {/* Error Message */}
            {errorMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                >
                    <ErrorState message={errorMessage} />
                </motion.div>
            )}
        </div>
    )
}

export default ResumeUploaderHome
