"use client"

import { ArrowRight, Menu, X, Key } from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from '@/stores/useAuth'
import Image from 'next/image'
import { signOut } from '@/app/actions'
import { useRouter } from 'next/navigation';
import { useSettings } from '@/stores/useSettings';

const navLinks = [
  {
    name: "Analytics",
    link: "/analytics",
    public: false
  },
  {
    name: "Practice",
    link: "/practice",
    public: false
  },
  {
    name: "Diagram(Beta)",
    link: "/diagram",
    public: false
  },
  {
    name: "Resume Builder",
    link: "/builder",
    public: true
  }
]

const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { geminiKey, setGeminiKey } = useSettings();
  const [keyInput, setKeyInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setKeyInput(geminiKey);
    }
  }, [isOpen, geminiKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 rounded-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black flex items-center gap-2 tracking-tight">API Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors rounded-full p-1 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6 font-medium">Bring your own Gemini API key to use RejectionGPT without limits or if the platform default key is unavailable.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">Gemini API Key</label>
            <input 
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full border-2 border-black bg-gray-50 rounded-lg px-4 py-2.5 text-black placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-black/10 transition-all font-mono text-sm"
            />
          </div>
          <button 
             onClick={() => { setGeminiKey(keyInput); onClose(); }}
             className="w-full bg-black text-white hover:bg-gray-800 transition-all font-bold py-3 rounded-xl border-2 border-black flex items-center justify-center gap-2"
          >
             Save Configuration
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user, setUser } = useAuth()
  const { initializeKeyFromCookie } = useSettings();
  const router = useRouter();

  useEffect(() => {
    initializeKeyFromCookie();
  }, [initializeKeyFromCookie]);

  return (
    <>
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
                  {navLinks.map((link, index) => {
                    if (!user && !link.public) return null;
                    return (
                      <Link prefetch={user ? true : false} href={link.link} key={index} className='text-sm font-medium text-gray-500 hover:text-black transition-colors'>
                        {link.name}
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center justify-center p-2 rounded-xl border-2 border-transparent hover:border-black hover:bg-gray-50 transition-all text-black md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    title="API Settings"
                >
                    <Key className="w-5 h-5 text-black" />
                </button>

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
        {isMenuOpen && <DropDownMenu onClose={() => setIsMenuOpen(false)} onSettingsOpen={() => { setIsMenuOpen(false); setIsSettingsOpen(true); }} />}
      </AnimatePresence>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  )
}

export default Navbar

const DropDownMenu = ({ onClose, onSettingsOpen }: { onClose: () => void, onSettingsOpen: () => void }) => {
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
        {navLinks.map((link, index) => {
          if (!user && !link.public) return null;
          return (
            <Link
              href={link.link}
              key={index}
              className="text-lg font-medium text-gray-600 hover:text-black transition-colors pb-4 border-b border-gray-50"
              onClick={onClose}
            >
              {link.name}
            </Link>
          )
        })}
        <button
          onClick={onSettingsOpen}
          className="text-lg font-medium text-left text-gray-600 hover:text-black transition-colors pb-4 border-b border-gray-50 flex items-center gap-2"
        >
          <Key className="w-5 h-5" /> API Settings
        </button>
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

