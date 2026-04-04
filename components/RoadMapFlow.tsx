"use client";

import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, BackgroundVariant } from "reactflow";
import "reactflow/dist/style.css";
import { getLayoutedElements } from "./dagreLayout";
import RoadmapNode from "./RoadmapNode";
import { useRoadmapProgress } from "@/stores/roadmapProgressStore";

const nodeTypes = {
  roadmapNode: RoadmapNode,
};

interface RoadmapNodeRaw {
  id: string;
  title: string;
  description?: string;
  category?: string;
  duration?: string;
  difficulty?: string;
}

interface RoadmapEdgeRaw {
  source: string;
  target: string;
}

interface RoadmapData {
  nodes: RoadmapNodeRaw[];
  edges: RoadmapEdgeRaw[];
}

export default function RoadmapFlow({ roadmapData, roadmapId }: { roadmapData: RoadmapData; roadmapId: string }) {
  const { completedNodes, toggleNode, resetRoadmap } = useRoadmapProgress((state) => ({
    completedNodes: state.completedNodes,
    toggleNode: state.toggleNode,
    resetRoadmap: state.resetRoadmap,
  }));
  const completed = useMemo(() => completedNodes[roadmapId] || [], [completedNodes, roadmapId]);
  const totalNodes = roadmapData.nodes.length;
  const progress = totalNodes === 0 ? 0 : Math.round((completed.length / totalNodes) * 100);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = roadmapData.nodes.map((n: RoadmapNodeRaw) => ({
      id: n.id,
      type: "roadmapNode",
      data: {
        title: n.title,
        description: n.description || "",
        category: n.category || "",
        duration: n.duration || "",
        difficulty: n.difficulty || "",
        isComplete: completed.includes(n.id),
        onToggleComplete: () => toggleNode(roadmapId, n.id),
      },
      position: { x: 0, y: 0 },
    }));

    const edges: Edge[] = roadmapData.edges.map((e: RoadmapEdgeRaw) => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      animated: true,
      style: {
        stroke: "#4a90e2",
        strokeWidth: 2,
      },
    }));

    return getLayoutedElements(nodes, edges, "TB"); // "TB" = top to bottom
  }, [completed, roadmapData, roadmapId, toggleNode]);

  return (
    <div className="w-full h-[85vh] bg-gray-50/50 relative border-b border-gray-200">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-3 rounded-full border border-gray-200 bg-white shadow-sm px-4 py-2 text-xs font-medium text-black">
        <span>{completed.length}/{totalNodes} complete</span>
        <span className="text-gray-500 font-bold">{progress}%</span>
        <button
          onClick={() => resetRoadmap(roadmapId)}
          className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-black hover:bg-gray-50 transition-colors ml-1"
        >
          Reset
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          style: { stroke: "#000", strokeWidth: 2 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
        <Controls 
          className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        <MiniMap
          nodeColor="#000"
          maskColor="rgba(255, 255, 255, 0.7)"
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}
