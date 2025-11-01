"use client"

import { FileText, Sparkles, Brain, MessageSquare, BarChart3, Zap, Shield, Target } from "lucide-react"
import { motion } from "framer-motion"

interface FeatureCard {
  icon: React.ReactNode
  title: string
  description: string
  size: "small" | "medium" | "large"
  gradient?: string
}

const features: FeatureCard[] = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Resume Analysis",
    description: "AI-powered analysis of your resume against job descriptions",
    size: "large",
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Match Score",
    description: "See how well you match with real-time scoring",
    size: "medium",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Mock Interviews",
    description: "Practice with AI-generated interview questions",
    size: "medium",
    gradient: "from-yellow-500/20 to-orange-500/20"
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "DSA Practice",
    description: "Tailored coding problems based on your weak areas",
    size: "small",
    gradient: "from-pink-500/20 to-rose-500/20"
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "AI Chat Assistant",
    description: "Get instant answers about resumes and job search",
    size: "small",
    gradient: "from-cyan-500/20 to-blue-500/20"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "ATS Optimized",
    description: "Ensure your resume passes applicant tracking systems",
    size: "medium",
    gradient: "from-indigo-500/20 to-purple-500/20"
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Targeted Feedback",
    description: "Get specific recommendations for improvement",
    size: "small",
    gradient: "from-violet-500/20 to-purple-500/20"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Fast & Efficient",
    description: "Get insights in seconds, not hours",
    size: "large",
    gradient: "from-amber-500/20 to-yellow-500/20"
  }
]

export default function FeaturesBentoGrid() {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case "large":
        return "md:col-span-2 md:row-span-2"
      case "medium":
        return "md:col-span-1 md:row-span-1"
      case "small":
        return "md:col-span-1 md:row-span-1"
      default:
        return ""
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-2">Powerful Features</h2>
        <p className="text-gray-400">Everything you need to land your dream job</p>
      </div>
      
      <div className="w-full p-3 h-[500px] flex">
        <div className="w-full h-full flex justify-around items-center gap-3 bg-white p-2">
          h
        </div>
        <div className="w-full h-ful flex justify-around items-center gap-3 bg-red-500">
           jf 
        </div>
        <div className="w-full h-full flex justify-around items-center gap-3 bg-blue-500">h</div>
        
      </div>
    </div>
  )
}

