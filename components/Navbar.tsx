"use client"

import { ArrowRight, Menu, X } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from '@/stores/useAuth'
import Image from 'next/image'
import { signOut } from '@/app/actions'
import { useRouter } from 'next/navigation';

const navLinks = [
  {
    name: "Analytics",
    link: "/analytics"
  },
  {
    name: "Practice",
    link: "/practice"
  },
  {
    name: "Diagram(Beta)",
    link: "/diagram"
  }
]

const Navbar = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, setUser } = useAuth()
  const router = useRouter();

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full fixed top-0 left-0 z-50 flex justify-center items-center bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
        <div className='max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-10'>
              <Link href={"/"} className="flex items-center gap-2">
                <span className="text-xl font-bold text-black tracking-tight">RejectionGPT</span>
              </Link>

              <div className='hidden md:flex items-center gap-8'>
                {user && navLinks.map((link, index) => (
                  <Link prefetch={user ? true : false} href={link.link} key={index} className='text-sm font-medium text-gray-500 hover:text-black transition-colors'>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <motion.button
                whileHover={{ scale: 1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', damping: 20 }}
                className='hidden md:flex items-center justify-center gap-2 bg-white text-black border-2 border-black px-5 py-2.5 rounded-xl text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] transition-all'
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
              >
                {user && <Image src={user.user_metadata?.avatar_url || ""} alt='user_profile' width={24} height={24} className='rounded-full object-cover' />}
                <span>{user ? `Sign out` : "Get started"}</span>
                <AnimatePresence>
                  {!user && (
                    <motion.div
                      key="arrow"
                      initial={{ x: 0 }}
                      animate={{ x: isHovering ? 5 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <button onClick={() => setIsMenuOpen(true)} className='md:hidden p-2 text-gray-600 hover:text-black transition-colors rounded-lg'>
                <Menu className='w-6 h-6' />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>
      {isMenuOpen && <DropDownMenu onClose={() => setIsMenuOpen(false)} />}
    </AnimatePresence>
  )
}

export default Navbar

const DropDownMenu = ({ onClose }: { onClose: () => void }) => {
  const { user, setUser } = useAuth();
  const router = useRouter();

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full sm:w-80 z-50 bg-white border-l border-gray-100 shadow-2xl flex flex-col pt-20 px-6"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-100"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex flex-col space-y-6">
        {user && navLinks.map((link, index) => (
          <Link
            href={link.link}
            key={index}
            className="text-lg font-medium text-gray-600 hover:text-black transition-colors pb-4 border-b border-gray-50"
            onClick={onClose}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <button
          className="w-full flex items-center justify-center gap-2 bg-white text-black border-2 border-black px-5 py-3 rounded-xl text-base font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] transition-all"
          onClick={async () => {
            if (user) {
              await signOut();
              setUser(null);
              router.push("/");
            } else {
              router.push("/login");
            }
            onClose();
          }}
        >
          {user ? `Sign out` : "Get started"}
        </button>
      </div>
    </motion.div>
  );
};

