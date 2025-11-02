"use client";

import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, BackgroundVariant } from "reactflow";
import "reactflow/dist/style.css";
import { getLayoutedElements } from "./dagreLayout";
import RoadmapNode from "./RoadmapNode";

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

export default function RoadmapFlow({ roadmapData }: { roadmapData: RoadmapData }) {
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
  }, [roadmapData]);

  return (
    <div className="w-full h-[85vh] bg-[#1a1919]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          style: { stroke: "#4a90e2", strokeWidth: 2 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls 
          className="bg-[#252525] border border-[#383838] rounded-lg"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        <MiniMap
          nodeColor="#4a90e2"
          maskColor="rgba(0, 0, 0, 0.6)"
          className="bg-[#252525] border border-[#383838] rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}
