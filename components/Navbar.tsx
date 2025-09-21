"use client"

import { ArrowRight, ChevronDown } from 'lucide-react'


import Link from 'next/link'
import React, { useState } from 'react'
import {AnimatePresence, motion} from "framer-motion";
import { useAuth } from '@/stores/useAuth'
import Image from 'next/image'
import { signOut } from '@/app/actions'
import { useRouter } from 'next/navigation';




const navLinks = [
    {
        name: "Analyze",
        link: "/analyze"
    },
    {
        name: "dashboard",
        link: "/dashboard"
    },
    
]



const Navbar = () => {
    const [isHovering, setIsHovering] = useState(false);
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {user, setUser} = useAuth()
    const router = useRouter();
    console.log(user)


   
  return (
    
    <AnimatePresence>
         
        
        
    <motion.nav initial={{ y: -15 }}
        animate={{ y:0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`w-full  z-50 flex justify-center items-center absolute`}
        style={{ position: "sticky" }}>
        {/* Decorative corner elements for the navbar */}
        
       
            
        <div className='xl:w-2/3 md:p-3 max-sm:p-4  w-full bg-transparent pt-5 border-[2px] border-t-0 border-dashed border-gray-500 relative'>
        

      
    


           
          <div className='flex justify-between items-center bg-transparent'>
            <div className='flex items-center gap-5 '>
                
                <Link href={"/"} className={`text-2xl font-[900] text-center mb-2 text-gray-300`}>RejectionGTP</Link>
                

                <div className='flex items-center gap-10 ml-5 max-sm:hidden'>
                    {navLinks.map((link, index) => (
                    <Link href={link.link} key={index} className='text-md  tracking-wide text-gray-300 hover:text-white'>
                        {link.name}
                    </Link>
                ))}
                </div>

            </div>
            <button  onClick={() => setIsMenuOpen(true)} className='xl:hidden  cursor-pointer md:hidden'><ChevronDown className='w-7 h-7 text-gray-300'/></button>
            <div className='flex flex-col items-center gap-3'>
            
            <motion.button
            initial={{ scale: 1 }}
            whileHover={{
                scale: 1.05,
                backgroundColor: '#d1d5db',
                color: '#1f2937',
            }}
            transition={{ type: 'spring', damping: 20 }}
            className='relative isolate inline-flex items-center justify-center text-base/6 uppercase font-mono tracking-widest shrink-0 focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500 data-[disabled]:opacity-50 [&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:sm:my-1 px-4 py-2 sm:text-sm [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:sm:size-4 gap-x-3 bg-[--btn-bg] [--btn-bg:transparent] [--btn-border:theme(colors.primary/25%)] [--btn-text:theme(colors.primary)] [--btn-hover:theme(colors.secondary/20%)] text-center w-auto p-2 rounded-full border-[0.3px] border-gray-400 shadow-none cursor-pointer '
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={async () => {
                    if (user) {
                      await signOut();
                      setUser(null);
                      router.push("/");
                    } else {
                      router.push("/login");
                    }
                  }}
            layout
            >
            
            {user && <Image src={user.user_metadata.avatar_url} alt='user_profile_image' width={30} height={30} className='rounded-full object-center' />}
            <h1 className={`${isHovering? "text-gray-800": "text-gray-300"}`}>{user ? `${user.user_metadata.full_name.split(" ")[0]}`: "Get started"}</h1>
            <AnimatePresence>
                {isHovering && (
                <motion.div
                    key="arrow"
                    initial={{ opacity: 0, x: -5, rotate:0 }}
                    animate={{ opacity: 1, x: 0 , rotate: -35}}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.2 }}
                    
                >
                    <ArrowRight className="w-7 h-6" />
                </motion.div>
                )}
            </AnimatePresence>
            </motion.button>
           
           
            </div>
      



            
          </div>
          
        </div>
    </motion.nav>
    {isMenuOpen && <DropDownMenu onClose={() => setIsMenuOpen(false)}/>}
    </AnimatePresence>
  )
}

export default Navbar


const DropDownMenu = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 w-full h-1/2 z-50 bg-black/60 backdrop-blur-md shadow-md flex flex-col items-center justify-center space-y-6 text-white"
    >
      {navLinks.map((link, index) => (
        <Link
          href={link.link}
          key={index}
          className="text-lg font-mono tracking-wide hover:underline"
          onClick={onClose}
        >
          {link.name}
        </Link>
      ))}

      <button
        onClick={onClose}
        className="absolute top-4 right-6 text-white text-2xl font-bold"
      >
        ×
      </button>
    </motion.div>
  );
};
