import { create } from 'zustand'

interface SettingsState {
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  initializeKeyFromCookie: () => void;
  /** BYOK removed: server uses GEMINI_API_KEY. Kept as deprecated shim. */
  isDeprecated: true;
}

/**
 * @deprecated BYOK cookie flow removed for security (XSS + user-controlled keys).
 * Server now uses GEMINI_API_KEY / OPENAI_API_KEY. This store is a no-op shim
 * kept to avoid breaking Navbar until its SettingsModal is removed.
 */
export const useSettings = create<SettingsState>()(
  () => ({
    geminiKey: '',
    isDeprecated: true as const,
    setGeminiKey: () => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[settings] BYOK disabled — configure GEMINI_API_KEY on server");
      }
    },
    initializeKeyFromCookie: () => {
      // no-op: do not read cookies
    },
  })
)
