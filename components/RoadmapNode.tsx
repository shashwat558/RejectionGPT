"use client";

import React from "react";
import { CheckCircle2, Circle, Clock, Tag, Zap, AlertCircle } from "lucide-react";
import { Handle, Position } from "reactflow";

interface RoadmapNodeData {
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty?: string;
  isComplete?: boolean;
  onToggleComplete?: () => void;
}

export default function RoadmapNode({ data }: { data: RoadmapNodeData }) {
  const getDifficultyStyles = (difficulty?: string) => {
    if (!difficulty) return "bg-gray-100 text-black border-black";
    const lower = difficulty.toLowerCase();
    if (lower.includes("easy")) return "bg-green-300 text-black border-black";
    if (lower.includes("medium")) return "bg-yellow-300 text-black border-black";
    if (lower.includes("hard")) return "bg-red-400 text-white border-black";
    return "bg-black text-white border-black";
  };

  const getCategoryTheme = (category?: string) => {
    if (!category) return { bg: "bg-blue-300", icon: <Tag className="w-3 h-3" /> };
    const lower = category.toLowerCase();
    if (lower.includes("foundation") || lower.includes("basic")) 
      return { bg: "bg-blue-300", icon: <Tag className="w-3 h-3" /> };
    if (lower.includes("advanced") || lower.includes("expert")) 
      return { bg: "bg-purple-300", icon: <Zap className="w-3 h-3" /> };
    if (lower.includes("project") || lower.includes("practice")) 
      return { bg: "bg-emerald-300", icon: <Tag className="w-3 h-3" /> };
    if (lower.includes("interview") || lower.includes("preparation")) 
      return { bg: "bg-orange-300", icon: <AlertCircle className="w-3 h-3" /> };
    return { bg: "bg-indigo-300", icon: <Tag className="w-3 h-3" /> };
  };

  const categoryTheme = getCategoryTheme(data.category);

  return (
    <div
      className={`px-5 py-4 min-w-[300px] max-w-[340px] bg-white border-4 border-black transition-all ${
        data.isComplete 
          ? "shadow-none translate-x-[6px] translate-y-[6px] opacity-80" 
          : "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-4 !h-4 !bg-white !border-4 !border-black !-top-2" 
      />
      
      {/* Header Area */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <h3 className={`text-lg font-black text-black leading-tight ${data.isComplete ? "line-through text-gray-500" : ""}`}>
          {data.title}
        </h3>
        <button
          onClick={data.onToggleComplete}
          className="text-black hover:scale-110 transition-transform flex-shrink-0"
          title={data.isComplete ? "Mark as incomplete" : "Mark as complete"}
        >
          {data.isComplete ? (
            <CheckCircle2 className="w-6 h-6 fill-black text-white" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {data.category && (
          <span
            className={`flex items-center gap-1 ${categoryTheme.bg} border-2 border-black text-black font-bold text-[10px] uppercase px-2 py-1 tracking-wider`}
          >
            {categoryTheme.icon}
            {data.category}
          </span>
        )}
        {data.difficulty && (
          <span
            className={`${getDifficultyStyles(data.difficulty)} border-2 font-bold text-[10px] uppercase px-2 py-1 tracking-wider`}
          >
            {data.difficulty}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm font-medium text-gray-800 mb-4 line-clamp-3 leading-snug">
        {data.description}
      </p>

      {/* Duration Footer */}
      {data.duration && (
        <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-black border-t-2 border-black pt-2">
          <Clock className="w-4 h-4" />
          <span>{data.duration}</span>
        </div>
      )}

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-4 !h-4 !bg-black !border-black !-bottom-2" 
      />
    </div>
  );
}

