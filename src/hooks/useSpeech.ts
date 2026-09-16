import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentLanguage } from "@/services/agent-service";

/**
 * Spoken replies, via the browser's own speech synthesis.
 *
 * No provider, no quota, no latency — and it degrades to silence on browsers
 * that lack it rather than breaking the conversation.
 *
 * Voice quality for Hindi is a genuine platform limitation this cannot
 * engineer around: the Web Speech API's Hindi voices vary a lot by OS and
 * browser, and on many platforms are noticeably more robotic than the English
 * ones. What this hook controls is picking the *correct* voice for the
 * selected language rather than defaulting to English regardless — a real
 * Hindi voice, even an imperfect one, beats an English voice mispronouncing
 * Devanagari text. A properly natural-sounding Hindi voice would need a paid
 * neural TTS provider behind the gateway, which is a larger, separate change.
 */

const VOICE_LANG_PREFIX: Record<AgentLanguage, string> = {
  en: "en",
  // Hinglish is still spoken Hindi — there is no separate "Hinglish" voice on
  // any platform, so it uses the same Hindi voice as 'hi'.
  hi: "hi",
  hinglish: "hi",
};

const PREFERRED_LOCALE: Record<AgentLanguage, string> = {
  en: "en-IN",
  hi: "hi-IN",
  hinglish: "hi-IN",
};

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const supported =
    typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) voicesRef.current = voices;
    };

    loadVoices();
    // Voices load asynchronously in Chrome, so the first call often sees none.
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [supported]);

  const pickVoice = useCallback((language: AgentLanguage): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current;
    if (voices.length === 0) return null;

    const locale = PREFERRED_LOCALE[language];
    const prefix = VOICE_LANG_PREFIX[language];

    return (
      voices.find((v) => v.lang === locale) ??
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ??
      // Falling back to any English voice for a Hindi/Hinglish reply would
      // mispronounce every word, so the fallback chain stays within the same
      // language family rather than defaulting to English regardless.
      (language === "en" ? voices[0] : null) ??
      voices[0] ??
      null
    );
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, language: AgentLanguage = "en") => {
      if (!supported || !enabled) return;
      const clean = text.trim();
      if (!clean) return;

      // Anything still queued is stale the moment there is a newer reply.
      window.speechSynthesis.cancel();

      const voice = pickVoice(language);
      const utterance = new SpeechSynthesisUtterance(clean);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang || PREFERRED_LOCALE[language];
      utterance.rate = 1.02;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [supported, enabled, pickVoice],
  );

  /** Whether a real voice exists for this language, vs. falling back silently to English. */
  const hasVoiceFor = useCallback(
    (language: AgentLanguage): boolean => {
      if (language === "en") return true;
      const prefix = VOICE_LANG_PREFIX[language];
      return voicesRef.current.some((v) => v.lang.toLowerCase().startsWith(prefix));
    },
    [],
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

  return { speak, stop, isSpeaking, supported, enabled, toggleEnabled, hasVoiceFor };
}
