import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Spoken replies, via the browser's own speech synthesis.
 *
 * No provider, no quota, no latency — and it degrades to silence on browsers
 * that lack it rather than breaking the conversation.
 */

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const supported =
    typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";

  useEffect(() => {
    if (!supported) return;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;
      // Prefer an Indian English voice for a store serving India, then any
      // English voice, then whatever the platform defaults to.
      voiceRef.current =
        voices.find((v) => v.lang === "en-IN") ??
        voices.find((v) => v.lang.startsWith("en")) ??
        voices[0] ??
        null;
    };

    pickVoice();
    // Voices load asynchronously in Chrome, so the first call often sees none.
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !enabled) return;
      const clean = text.trim();
      if (!clean) return;

      // Anything still queued is stale the moment there is a newer reply.
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(clean);
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.lang = voiceRef.current?.lang || "en-IN";
      utterance.rate = 1.02;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [supported, enabled],
  );

  // Leaving the page mid-sentence should not keep the browser talking.
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => {
      if (prev) stop();
      return !prev;
    });
  }, [stop]);

  return { speak, stop, isSpeaking, supported, enabled, toggleEnabled };
}
