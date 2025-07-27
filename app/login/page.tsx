'use client';

import { Button } from '@/components/ui/button';

import { motion } from 'framer-motion';
import { Github,  Twitter } from 'lucide-react';
import { Roboto_Mono } from 'next/font/google';
import Image from 'next/image';
import { signInWIthGoogle } from '../actions';
import { NumberTicker } from '@/components/magicui/number-ticker';



const play = Roboto_Mono({
  weight: "variable",
  subsets: ["latin"]
})

export default function LoginPage() {
  return (
    <div className={`${play.className} min-h-screen flex items-center justify-center p-3`}>
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
      <h1 className={`${play.className} absolute top-[5%] left-[10%] text-2xl font-[900] text-white`}>RejectionGPT</h1>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md h-[490px] rounded-lg border-t-2  border-[#2E2E2E]   p-8 bg-[#181916] shadow-[inset_0px_0px_24px_3px_#222222]"
      >
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-20 h-20  flex items-center justify-center mb-6 border-2 border-[#1b1b1b] shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-[#181717] rounded-lg"
            > 
            <Image src={"/logo.png"} alt='logo' sizes='lg' width={200} height={200} className='object-cover w-20 h-20 rounded-md border-b-2 border-[#1b1b1b]   shadow-[inset_0px_0px_24px_3px_#282828]'/>
          </motion.div>

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
            <div className="relative">
              <Button
                
                className="w-full flex px-4 py-6 border-b-2 border-[#202020] rounded-sm bg-[#161616] hover:border-0 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                onClick={signInWIthGoogle}
              >Google</Button>
            </div>

            <div className="relative">
              <Button
                
                className="w-full flex px-4 py-6 border-b-2 border-[#202020] rounded-sm bg-[#161616] hover:border-0 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              ><Github className='w-5 h-5'/> Github</Button>
              
            </div>
            <div className="relative">
              <Button
                
                className="w-full flex px-4 py-6 border-b-2 border-[#202020] rounded-sm bg-[#161616] hover:border-0 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              ><Twitter className='w-5 h-5 text-blue-500'/>
                Twitter</Button>
              
            </div>
            <div className='w-full h-[1px] bg-[#222222] '></div>
            <div className='w-full '>
              <h1 className='whitespace-pre-wrap text-md font-medium tracking-tighter text-gray-400 text-center'>Trusted by <NumberTicker value={100} className='whitespace-pre-wrap text-md font-medium tracking-tighter text-gray-300'/>+ users</h1>
            </div>

            

            

            
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}