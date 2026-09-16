import { useCallback, useEffect, useRef, useState } from "react";
import { pickAudioMimeType } from "@/services/agent-service";

/**
 * Microphone recording for the shopping assistant.
 *
 * The important part is the teardown: every path stops the MediaStream tracks.
 * If they are left running the browser keeps showing its "recording" indicator
 * and holds the microphone open, which users reasonably read as the site
 * listening to them after they have finished speaking.
 */

export type RecorderError =
  | "unsupported"
  | "permission-denied"
  | "no-audio"
  | "failed";

interface UseVoiceRecorder {
  isRecording: boolean;
  /** Seconds elapsed in the current recording. */
  elapsed: number;
  error: RecorderError | null;
  start: () => Promise<void>;
  /** Resolves with the recorded audio, or null if nothing usable was captured. */
  stop: () => Promise<Blob | null>;
  cancel: () => void;
  clearError: () => void;
}

/** Long enough for any real request, short enough to bound an accidental recording. */
const MAX_DURATION_MS = 30_000;

export function useVoiceRecorder(): UseVoiceRecorder {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<RecorderError | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const resolveRef = useRef<((blob: Blob | null) => void) | null>(null);
  const timerRef = useRef<number | null>(null);
  const autoStopRef = useRef<number | null>(null);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoStopRef.current !== null) {
      window.clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  }, []);

  // A component unmounting mid-recording must not leave the mic open.
  useEffect(() => releaseStream, [releaseStream]);

  const start = useCallback(async () => {
    setError(null);

    const mimeType = pickAudioMimeType();
    if (!mimeType || !navigator.mediaDevices?.getUserMedia) {
      setError("unsupported");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch {
      // Denied, dismissed, or no device — all look the same to the caller and
      // all mean "we cannot record", so they share one message.
      setError("permission-denied");
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];

    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const blob = chunksRef.current.length
        ? new Blob(chunksRef.current, { type: mimeType })
        : null;
      chunksRef.current = [];
      releaseStream();
      setIsRecording(false);
      setElapsed(0);
      resolveRef.current?.(blob && blob.size > 0 ? blob : null);
      resolveRef.current = null;
    };

    recorder.onerror = () => {
      releaseStream();
      setIsRecording(false);
      setError("failed");
      resolveRef.current?.(null);
      resolveRef.current = null;
    };

    recorder.start();
    setIsRecording(true);
    setElapsed(0);

    timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    autoStopRef.current = window.setTimeout(() => {
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    }, MAX_DURATION_MS);
  }, [releaseStream]);

  const stop = useCallback(async (): Promise<Blob | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") {
      releaseStream();
      setIsRecording(false);
      return null;
    }
    return new Promise<Blob | null>((resolve) => {
      resolveRef.current = resolve;
      recorder.stop();
    });
  }, [releaseStream]);

  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    // Drop the audio before stopping, so onstop resolves with nothing.
    chunksRef.current = [];
    resolveRef.current = null;
    if (recorder && recorder.state === "recording") recorder.stop();
    releaseStream();
    setIsRecording(false);
    setElapsed(0);
  }, [releaseStream]);

  const clearError = useCallback(() => setError(null), []);

  return { isRecording, elapsed, error, start, stop, cancel, clearError };
}
