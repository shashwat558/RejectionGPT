"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto w-full z-10">
      <div className="mx-auto px-4 py-4 max-w-7xl w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            Made by this guy —{" "}
            <Link
              href="https://x.com/shashwatj26"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-gray-600 transition-colors inline-flex items-center gap-1 font-medium"
            >
              shashwatt
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
