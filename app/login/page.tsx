'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { signInWIthGoogle } from '../actions';
import { useAuth } from '@/stores/useAuth';
import { redirect } from 'next/navigation';

export default function LoginPage() {
  const { user } = useAuth();
  if (user) {
    redirect('/')
  }
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gray-50/50`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-10"
      >
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 flex items-center justify-center mb-6 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          >
            <Image src={"/logo2.svg"} alt='logo' sizes='lg' width={64} height={64} className='object-cover' />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-black mb-2 tracking-tight"
          >
            Welcome back
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-gray-600 font-medium text-center mb-8"
          >
            Turn rejections into results
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full space-y-8"
          >
            <button
              className="w-full h-12 flex items-center justify-center gap-3 bg-white border-2 border-black rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-all font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px]"
              onClick={signInWIthGoogle}
            >
              <svg height={24} width={24} viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"></path><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"></path><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"></path><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"></path></g></svg>
              Continue with Google
            </button>

            <div className="w-full pt-6 border-t border-gray-200">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-4 text-center">What you&apos;ll get</h3>

              <div className="space-y-3 font-medium">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-black mt-1.5"></div>
                  <span className="text-sm text-gray-800">AI-powered resume analysis & scoring</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-black mt-1.5"></div>
                  <span className="text-sm text-gray-800">Personalized interview questions & practice</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-black mt-1.5"></div>
                  <span className="text-sm text-gray-800">DSA problems tailored to your skills</span>
                </div>
              </div>

              <div className="mt-8 text-xs text-gray-600 text-center font-medium">
                Join <span className="text-black font-bold">1,000+</span> developers who&apos;ve improved their job prospects
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}