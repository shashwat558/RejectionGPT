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
        className="xl:hidden fixed top-5 left-4 z-40 p-2.5 rounded-xl bg-white border border-gray-200 text-black shadow-sm hover:bg-gray-50 transition-colors"
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
              className="xl:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="xl:hidden fixed left-0 top-0 h-full w-80 z-50 bg-gray-50/90 backdrop-blur shadow-2xl border-r border-gray-200 overflow-hidden"
            >
              <div className="absolute right-4 top-4 z-50 pointer-events-auto">
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 rounded-lg bg-white hover:bg-gray-50 text-gray-500 hover:text-black transition-colors border border-gray-200 shadow-sm"
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
