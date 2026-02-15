import { create } from "zustand"
import { persist } from "zustand/middleware"

interface RoadmapProgressState {
  completedNodes: Record<string, string[]>
  toggleNode: (roadmapId: string, nodeId: string) => void
  resetRoadmap: (roadmapId: string) => void
}

export const useRoadmapProgress = create(
  persist<RoadmapProgressState>(
    (set, get) => ({
      completedNodes: {},
      toggleNode(roadmapId, nodeId) {
        set((state) => {
          const current = state.completedNodes[roadmapId] || []
          const isComplete = current.includes(nodeId)
          return {
            completedNodes: {
              ...state.completedNodes,
              [roadmapId]: isComplete
                ? current.filter((id) => id !== nodeId)
                : [...current, nodeId],
            },
          }
        })
      },
      resetRoadmap(roadmapId) {
        set((state) => ({
          completedNodes: {
            ...state.completedNodes,
            [roadmapId]: [],
          },
        }))
      },
    }),
    {
      name: "roadmap-progress-storage",
    }
  )
)
