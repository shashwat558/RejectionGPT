"use client";

import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
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
  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return "bg-blue-500";
    const lower = difficulty.toLowerCase();
    if (lower.includes("easy")) return "bg-green-500";
    if (lower.includes("medium")) return "bg-yellow-500";
    if (lower.includes("hard")) return "bg-red-500";
    return "bg-blue-500";
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return "bg-purple-500";
    const lower = category.toLowerCase();
    if (lower.includes("foundation") || lower.includes("basic")) return "bg-blue-500";
    if (lower.includes("advanced") || lower.includes("expert")) return "bg-purple-500";
    if (lower.includes("project") || lower.includes("practice")) return "bg-green-500";
    if (lower.includes("interview") || lower.includes("preparation")) return "bg-orange-500";
    return "bg-indigo-500";
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-[#161616] min-w-[280px] max-w-[320px] ${
        data.isComplete ? "border-white/40" : "border-white/10"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#4a90e2]" style={{ width: 8, height: 8 }} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-bold text-gray-100 flex-1 leading-tight pr-2">
          {data.title}
        </h3>
        <button
          onClick={data.onToggleComplete}
          className="text-gray-400 hover:text-white transition-colors"
          title={data.isComplete ? "Mark as incomplete" : "Mark as complete"}
        >
          {data.isComplete ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
        </button>
        {data.difficulty && (
          <span
            className={`${getDifficultyColor(data.difficulty)} text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap`}
          >
            {data.difficulty}
          </span>
        )}
      </div>

      {/* Category Badge */}
      {data.category && (
        <div className="mb-2">
          <span
            className={`${getCategoryColor(data.category)} text-white text-xs px-2 py-1 rounded-md inline-block`}
          >
            {data.category}
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-gray-300 mb-3 line-clamp-3 leading-relaxed">
        {data.description}
      </p>

      {/* Duration */}
      {data.duration && (
        <div className="flex items-center gap-1 text-xs text-gray-400 border-t border-white/10 pt-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">{data.duration}</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-[#4a90e2]" style={{ width: 8, height: 8 }} />
    </div>
  );
}

