/**
 * Interviewer voice client — queues Deepgram TTS audio from /api/interview/speak.
 * Captions-first: text is always shown; audio is progressive enhancement.
 * If TTS is unconfigured/fails, callers get { played: false } and continue silently.
 */

export type VoiceState = "idle" | "loading" | "speaking" | "unavailable";

let current: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let muted = false;

export function setVoiceMuted(m: boolean) {
  muted = m;
  if (m) stopVoice();
}

export function isVoiceMuted() {
  return muted;
}

export function stopVoice() {
  try {
    current?.pause();
  } catch {
    // ignore
  }
  current = null;
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
}

/**
 * Speak text via the TTS proxy. Resolves when audio ends (or immediately
 * with { played: false } when muted/unavailable). Rejects only on network-level
 * failure of an available service — callers should catch and continue anyway.
 */
export async function speakText(
  interviewId: string,
  text: string,
  opts?: { signal?: AbortSignal; onState?: (s: VoiceState) => void }
): Promise<{ played: boolean }> {
  const clean = text.trim().slice(0, 2000);
  if (!clean || muted) return { played: false };
  if (opts?.signal?.aborted) return { played: false };

  opts?.onState?.("loading");
  stopVoice();

  let res: Response;
  try {
    res = await fetch("/api/interview/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewId, text: clean }),
      signal: opts?.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") return { played: false };
    throw e;
  }

  if (res.status === 503) {
    // TTS not configured — degrade to silent captions permanently for session
    opts?.onState?.("unavailable");
    return { played: false };
  }
  if (!res.ok) throw new Error(`TTS failed: ${res.status}`);

  const blob = await res.blob();
  if (opts?.signal?.aborted) return { played: false };
  const url = URL.createObjectURL(blob);
  currentUrl = url;

  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    current = audio;
    opts?.onState?.("speaking");
    const cleanup = () => {
      if (current === audio) current = null;
      URL.revokeObjectURL(url);
      if (currentUrl === url) currentUrl = null;
    };
    audio.onended = () => {
      cleanup();
      opts?.onState?.("idle");
      resolve({ played: true });
    };
    audio.onerror = () => {
      cleanup();
      opts?.onState?.("idle");
      reject(new Error("Audio playback failed"));
    };
    opts?.signal?.addEventListener("abort", () => {
      try {
        audio.pause();
      } catch {
        // ignore
      }
      cleanup();
      opts?.onState?.("idle");
      resolve({ played: false });
    });
    audio.play().catch(() => {
      // Autoplay blocked (no user gesture yet) — caller shows captions + replay
      cleanup();
      opts?.onState?.("idle");
      resolve({ played: false });
    });
  });
}
