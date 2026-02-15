export interface ChatSource {
  title?: string
  uri?: string
  domain?: string
}

export interface ChatHistoryEntry {
  role: "user" | "model"
  parts: { text: string }[]
}

export interface ChatShareMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
  sources?: ChatSource[]
}

export const CHAT_SOURCE_DELIMITER = "###END_OF_TEXT###"
