"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MicState = "unsupported" | "idle" | "listening" | "denied" | "error";

export const STT_LANGUAGE = "en-IN";
const MAX_AUTO_RESTARTS = 25;
const RESTART_DELAY_MS = 250;

interface ResultItem {
  isFinal: boolean;
  transcript: string;
}

/**
 * Pure helper — splits a batch of recognition results into committed
 * finals + pending interim text. Unit-tested in useSpeechToText.test.ts.
 */
export function splitSpeechResults(items: ResultItem[]): { finals: string[]; interim: string } {
  const finals: string[] = [];
  const interimParts: string[] = [];
  for (const item of items) {
    const text = (item.transcript || "").trim();
    if (!text) continue;
    if (item.isFinal) finals.push(text);
    else interimParts.push(text);
  }
  return { finals, interim: interimParts.join(" ").trim() };
}

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: { resultIndex: number; results: ArrayLike<ResultItem> }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as
    | (new () => SpeechRecognitionInstance)
    | null;
}

/**
 * Hardened Web Speech API wrapper (candidate mic — no third-party STT).
 * - Browser-support gate with explicit "unsupported" state
 * - Final segments committed via onFinalText (typed text is never overwritten)
 * - Interim results exposed separately as a live caption (never committed)
 * - Auto-restart on silence auto-stop (onend) while listening is intended
 * - Permission denial surfaced as "denied" instead of failing silently
 */
export function useSpeechToText(opts?: { language?: string; onFinalText?: (segment: string) => void }) {
  const [supported] = useState(() => getSpeechRecognitionCtor() !== null);
  const [micState, setMicState] = useState<MicState>("idle");
  const [interim, setInterim] = useState("");

  const recogRef = useRef<SpeechRecognitionInstance | null>(null);
  const wantRef = useRef(false);
  const restartsRef = useRef(0);
  const onFinalRef = useRef(opts?.onFinalText);
  onFinalRef.current = opts?.onFinalText;
  const language = opts?.language ?? STT_LANGUAGE;

  const stop = useCallback(() => {
    wantRef.current = false;
    restartsRef.current = 0;
    try {
      recogRef.current?.stop();
    } catch {
      // already stopped
    }
    setInterim("");
    setMicState((s) => (s === "unsupported" || s === "denied" ? s : "idle"));
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setMicState("unsupported");
      return;
    }
    try {
      recogRef.current?.abort();
    } catch {
      // nothing running
    }
    const recog = new Ctor();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = language;

    recog.onresult = (ev) => {
      const items: ResultItem[] = [];
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r) items.push({ isFinal: r.isFinal, transcript: r.transcript });
      }
      const { finals, interim: interimText } = splitSpeechResults(items);
      for (const segment of finals) onFinalRef.current?.(segment);
      setInterim(interimText);
    };

    recog.onerror = (ev) => {
      const code = ev?.error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        wantRef.current = false;
        setInterim("");
        setMicState("denied");
      } else if (code === "network" || code === "no-speech" || code === "aborted") {
        // Transient — onend auto-restart handles recovery.
      } else {
        setMicState("error");
      }
    };

    recog.onend = () => {
      setInterim("");
      if (!wantRef.current) {
        setMicState((s) => (s === "listening" ? "idle" : s));
        return;
      }
      if (restartsRef.current < MAX_AUTO_RESTARTS) {
        restartsRef.current += 1;
        const attempt = recog;
        window.setTimeout(() => {
          if (!wantRef.current) return;
          try {
            attempt.start();
          } catch {
            // start raced with stop/abort — onend will not refire; mark idle
            if (wantRef.current) setMicState("error");
          }
        }, RESTART_DELAY_MS);
      } else {
        wantRef.current = false;
        setMicState("error");
      }
    };

    recogRef.current = recog;
    wantRef.current = true;
    restartsRef.current = 0;
    setMicState((s) => (s === "denied" ? s : s)); // keep denied sticky until retry succeeds
    try {
      recog.start();
      setMicState("listening");
    } catch {
      wantRef.current = false;
      setMicState("error");
    }
  }, [language]);

  // If previously denied, a manual retry should clear the flag first.
  const retry = useCallback(() => {
    setMicState("idle");
    start();
  }, [start]);

  useEffect(() => {
    if (!supported) setMicState("unsupported");
    return () => {
      wantRef.current = false;
      try {
        recogRef.current?.abort();
      } catch {
        // ignore
      }
    };
  }, [supported]);

  return { supported, micState, interim, start, stop, retry };
}
