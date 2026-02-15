"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import FeedbackSidebar from "./feedbackSidebar"
import { motion, AnimatePresence } from "framer-motion"

interface MobileSidebarToggleProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feedbacks: any[]
  currentId: string
}

export default function MobileSidebarToggle({ feedbacks, currentId }: MobileSidebarToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Use feedbacks prop or empty array to avoid undefined
  const safeFeedbacks = feedbacks || [];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="xl:hidden fixed top-5 left-4 z-40 p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="xl:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="xl:hidden fixed left-0 top-0 h-full w-80 z-50 bg-[#09090b] shadow-2xl border-r border-[#1a1a1a] overflow-hidden"
            >
              <div className="absolute right-4 top-4 z-50 pointer-events-auto">
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 rounded-lg bg-black/50 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5 backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="h-full pt-14">
                <FeedbackSidebar 
                  feedbacks={safeFeedbacks} 
                  currentId={currentId} 
                  className="!flex !w-full !h-full border-none shadow-none bg-transparent" 
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
