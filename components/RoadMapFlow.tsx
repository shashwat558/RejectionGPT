"use client";

import React, { useMemo, useCallback } from "react";
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, BackgroundVariant, Panel, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { getLayoutedElements } from "./dagreLayout";
import RoadmapNode from "./RoadmapNode";
import { useRoadmapProgress } from "@/stores/roadmapProgressStore";
import { toPng } from 'html-to-image';
import { Download, RotateCcw, Map } from "lucide-react";

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

function FlowInner({ roadmapData, roadmapId }: { roadmapData: RoadmapData; roadmapId: string }) {
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
        stroke: "#000",
        strokeWidth: 3,
      },
    }));

    return getLayoutedElements(nodes, edges, "TB");
  }, [completed, roadmapData, roadmapId, toggleNode]);

  const downloadImage = useCallback(() => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (element) {
      toPng(element, {
        backgroundColor: '#f9fafb',
      }).then((dataUrl) => {
        const a = document.createElement('a');
        a.setAttribute('download', `${roadmapId}-roadmap.png`);
        a.setAttribute('href', dataUrl);
        a.click();
      }).catch((err) => console.error("Error downloading image:", err));
    }
  }, [roadmapId]);

  return (
    <div className="w-full h-[85vh] bg-white relative border-b-4 border-black border-r-4">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          style: { stroke: "#000", strokeWidth: 3 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#000" className="opacity-20" />
        
        {/* Info Panel */}
        <Panel position="top-left" className="m-4">
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 max-w-[250px]">
            <h2 className="text-xl text-black font-black flex items-center gap-2 mb-2 uppercase tracking-wide">
              <Map className="w-6 h-6" /> Pathway
            </h2>
            <p className="text-sm font-medium text-gray-700 leading-snug">
              Follow this roadmap step by step. Expand features by interacting with nodes.
            </p>
          </div>
        </Panel>

        {/* Action Panel */}
        <Panel position="top-right" className="m-4">
          <div className="flex flex-col items-end gap-4">
            {/* Progress Badge */}
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-4 py-2 flex items-center gap-3">
              <span className="font-bold text-black border-r-2 border-black pr-3">{completed.length}/{totalNodes} nodes</span>
              <span className="font-black text-black bg-yellow-300 px-2 py-0.5 border-2 border-black">{progress}%</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => resetRoadmap(roadmapId)}
                className="bg-red-400 hover:bg-red-500 hover:-translate-y-1 transition-all text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-3 py-2 flex items-center gap-2 text-sm uppercase"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              
              <button
                onClick={downloadImage}
                className="bg-indigo-300 hover:bg-indigo-400 hover:-translate-y-1 transition-all text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-3 py-2 flex items-center gap-2 text-sm uppercase"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>
        </Panel>

        <Controls 
          className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden m-4 [&>button]:border-b-2 [&>button]:border-black [&>button:last-child]:border-b-0 hover:[&>button]:bg-gray-100 [&>button]:text-black"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        
        <MiniMap
          nodeColor={(n) => {
            if (n.data?.isComplete) return "#34d399";
            return "#000";
          }}
          maskColor="rgba(255, 255, 255, 0.8)"
          className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none m-4 !w-[200px]"
        />
      </ReactFlow>
    </div>
  );
}

export default function RoadmapFlow({ roadmapData, roadmapId }: { roadmapData: RoadmapData; roadmapId: string }) {
  return (
    <ReactFlowProvider>
      <FlowInner roadmapData={roadmapData} roadmapId={roadmapId} />
    </ReactFlowProvider>
  );
}
