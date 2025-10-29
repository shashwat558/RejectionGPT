'use client';



import { motion } from 'framer-motion';

import { Roboto_Mono } from 'next/font/google';
import Image from 'next/image';
import { signInWIthGoogle } from '../actions';
import { useAuth } from '@/stores/useAuth';
import { redirect } from 'next/navigation';



const play = Roboto_Mono({
  weight: "variable",
  subsets: ["latin"]
})

export default function LoginPage() {
  const {user} = useAuth();
  if(user){
    redirect('/')
  }
  return (
    <div className={`${play.className} h-screen flex items-center justify-center p-3 overflow-hidden`}>
      <div className='fixed top-[20%] left-[4%] w-20 h-10 bg-[#232323] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-r-2 border-[#292929] rounded-md p-5 flex gap-1 -z-10'>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        </div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        </div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        </div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
      </div>
       <div className='fixed top-[80%] left-[10%] w-20 h-10 bg-[#232323] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-r-2 border-[#292929] rounded-md p-5 flex gap-1 -z-10'>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        </div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        </div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        </div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
      </div>
       <div className='fixed top-[20%] left-[90%] w-20 h-10 bg-[#232323] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-r-2 border-[#292929] rounded-md p-5 flex gap-1 -z-10'>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        </div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        </div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        </div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
      </div>
       <div className='fixed top-[80%] left-[80%] w-20 h-10 bg-[#232323] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-r-2 border-[#292929] rounded-md p-5 flex gap-1 -z-10'>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        </div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        </div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
          <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        </div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
        <div className='w-[1.5px] h-[1.5px] rounded-full bg-gray-300'></div>
      </div>
      <div className='border-[1.3px] w-full max-w-md flex justify-center items-center border-gray-600 p-[2px] rounded-xl'>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border-t-2 border-r-2 border-l-2 border-[#3a3a3a] p-8 bg-[#181916] shadow-[inset_0px_0px_24px_3px_#222222]"
      >
        <div className="flex flex-col items-center">
       <div className="w-[85px]  h-[84px] flex justify-center rounded-lg p-[0.5px] border-gray-600 border-[1.3px]">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-20 h-20  flex items-center justify-center mb-6 border-t-2 border-r-2 border-l-2 border-b-2   border-[#3a3a3a] shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-[#181717] rounded-lg"
            > 

            <Image src={"/logo.png"} alt='logo' sizes='lg' width={200} height={200} className='object-cover w-20 h-20 rounded-md border-b-2 border-[#1b1b1b]   shadow-[inset_0px_0px_24px_3px_#282828]'/>
          </motion.div>
          </div>

          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-semibold text-gray-300 mb-2"
          >
            Welcome!
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-center mb-8"
          >
            Turn rejections into results
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full space-y-4"
          >
            <div className="relative flex  items-center justify-center">
              <div
                
                className="w-1/2 aspect-square flex items-center h-20 justify-center  border-b-2 border-[#292929] rounded-sm bg-[#161616] hover:border-0 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer text-gray-300 text-center"
                onClick={signInWIthGoogle}
              ><svg height={50} width={50} viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"></path><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"></path><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"></path><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"></path></g></svg></div>
            </div>

          {/* App features showcase */}
          <div className="mt-6 w-full space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-300 mb-2">What you&apos;ll get:</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-md border border-[#2a2a2a] bg-[#161616]">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-gray-300">AI-powered resume analysis & scoring</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md border border-[#2a2a2a] bg-[#161616]">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-gray-300">Personalized interview questions & practice</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md border border-[#2a2a2a] bg-[#161616]">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span className="text-gray-300">DSA problems tailored to your skills</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md border border-[#2a2a2a] bg-[#161616]">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-gray-300">Smart career guidance & feedback</span>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Join <span className="text-gray-300 font-medium">1,000+</span> developers who&apos;ve improved their job prospects
            </div>
          </div>

            

            

            
          </motion.div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}