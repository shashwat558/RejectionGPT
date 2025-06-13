"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"


interface MobileSidebarToggleProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feedbacks: any[]
  currentId: string
}

export default function MobileSidebarToggle({ feedbacks, currentId }: MobileSidebarToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-[#333] text-gray-300"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50">
          <div className="absolute left-0 top-0 h-full w-64 bg-[#1e1e1e] shadow-lg">
            <div className="flex justify-end p-4">
              <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FeedbackSidebar feedbacks={feedbacks} currentId={currentId} />
          </div>
        </div>
      )}
    </>
  )
}
