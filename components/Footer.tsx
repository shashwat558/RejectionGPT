"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-[#383838] bg-[#1e1e1e] mt-auto w-full">
      <div className="mx-auto px-4 py-1">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            Made by this guy —{" "}
            <Link
              href="https://x.com/shashwatj26"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-gray-200 transition-colors inline-flex items-center gap-1"
            >
              shashwatt
              <ExternalLink className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

