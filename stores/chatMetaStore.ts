import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ConversationMeta {
  id: string
  title: string
  lastMessage: string
  updatedAt: string
  tags: string[]
  memory: string
  pinnedMessageIds: string[]
}

interface ChatMetaState {
  conversations: Record<string, ConversationMeta>
  ensureConversation: (id: string) => void
  upsertConversation: (meta: Partial<ConversationMeta> & { id: string }) => void
  addTag: (id: string, tag: string) => void
  removeTag: (id: string, tag: string) => void
  setMemory: (id: string, memory: string) => void
  togglePinnedMessage: (id: string, messageId: string) => void
}

const createDefaultConversation = (id: string): ConversationMeta => ({
  id,
  title: "Untitled chat",
  lastMessage: "",
  updatedAt: new Date().toISOString(),
  tags: [],
  memory: "",
  pinnedMessageIds: [],
})

export const useChatMeta = create(
  persist<ChatMetaState>(
    (set, get) => ({
      conversations: {},
      ensureConversation(id) {
        const existing = get().conversations[id]
        if (existing) return
        set((state) => ({
          conversations: {
            ...state.conversations,
            [id]: createDefaultConversation(id),
          },
        }))
      },
      upsertConversation(meta) {
        set((state) => {
          const existing = state.conversations[meta.id] || createDefaultConversation(meta.id)
          return {
            conversations: {
              ...state.conversations,
              [meta.id]: {
                ...existing,
                ...meta,
              },
            },
          }
        })
      },
      addTag(id, tag) {
        const trimmed = tag.trim()
        if (!trimmed) return
        set((state) => {
          const existing = state.conversations[id] || createDefaultConversation(id)
          if (existing.tags.includes(trimmed)) return state
          return {
            conversations: {
              ...state.conversations,
              [id]: {
                ...existing,
                tags: [...existing.tags, trimmed],
                updatedAt: new Date().toISOString(),
              },
            },
          }
        })
      },
      removeTag(id, tag) {
        set((state) => {
          const existing = state.conversations[id] || createDefaultConversation(id)
          return {
            conversations: {
              ...state.conversations,
              [id]: {
                ...existing,
                tags: existing.tags.filter((t) => t !== tag),
                updatedAt: new Date().toISOString(),
              },
            },
          }
        })
      },
      setMemory(id, memory) {
        set((state) => {
          const existing = state.conversations[id] || createDefaultConversation(id)
          return {
            conversations: {
              ...state.conversations,
              [id]: {
                ...existing,
                memory,
                updatedAt: new Date().toISOString(),
              },
            },
          }
        })
      },
      togglePinnedMessage(id, messageId) {
        set((state) => {
          const existing = state.conversations[id] || createDefaultConversation(id)
          const isPinned = existing.pinnedMessageIds.includes(messageId)
          return {
            conversations: {
              ...state.conversations,
              [id]: {
                ...existing,
                pinnedMessageIds: isPinned
                  ? existing.pinnedMessageIds.filter((mid) => mid !== messageId)
                  : [...existing.pinnedMessageIds, messageId],
                updatedAt: new Date().toISOString(),
              },
            },
          }
        })
      },
    }),
    {
      name: "chat-meta-storage",
    }
  )
)
