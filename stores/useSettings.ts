import { create } from 'zustand'

interface SettingsState {
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  initializeKeyFromCookie: () => void;
}

export const useSettings = create<SettingsState>()(
  (set) => ({
    geminiKey: '',
    setGeminiKey: (key: string) => {
      set({ geminiKey: key });
      if (typeof document !== 'undefined') {
        document.cookie = `gemini_api_key=${encodeURIComponent(key)}; max-age=31536000; path=/`;
      }
    },
    initializeKeyFromCookie: () => {
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(new RegExp('(^| )gemini_api_key=([^;]+)'));
        if (match) {
          set({ geminiKey: decodeURIComponent(match[2]) });
        }
      }
    }
  })
)
