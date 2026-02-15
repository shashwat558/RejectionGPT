import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ChatSource } from "@/lib/types/chat"


interface Message {
    id: string,
    content: string,
    role: "user" | "assistant" ,
    timestamp: Date,
    isTyping?: boolean
    sources?: ChatSource[]
}
type messagesState = {
  messages: Message[],
  setMessages: (updater: (prev: Message[]) => Message[]) => void

}

export const useMessages = create(
    persist<messagesState>(
        (set) => ({
            messages: [{
                id: "1",
                content: "Hey, there i am an helpful AI assistant which help you not face another rejection and get you the job you wanted.",
                role: "assistant",
                timestamp: new Date(),
            }],
            setMessages(updater) {
                set((state) => ({
                    messages: updater(state.messages ?? [])
                }));
            },
        }),
        {
            name: "messages-storage",
            partialize(state) {
                return { messages: state.messages, setMessages: state.setMessages }
            },
        }
    )
)