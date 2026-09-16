import { api } from "@/services/api";

/**
 * Shopping assistant client.
 *
 * The session id is issued by the server and echoed back on each turn so the
 * conversation keeps its thread. It is stored per browser tab rather than
 * persisted: a returning customer starts fresh instead of resuming a stale
 * conversation about products whose prices may since have changed.
 */

export interface AgentClientAction {
  type: "add_to_cart";
  variantId: string;
  quantity: number;
  /** Display fields, so the browser can build a complete cart line. */
  name: string;
  image: string;
  price: string;
  priceNumber: number;
  notes?: string;
  categorySlug?: string;
  stockQty?: number;
}

export interface AgentReply {
  sessionId: string;
  reply: string;
  toolsUsed: string[];
  clientActions: AgentClientAction[];
}

export interface AgentStatus {
  available: boolean;
  maxMessageLength: number;
}

const SESSION_STORAGE_KEY = "faithfulmeat.agent.session";

export const readSessionId = (): string | null => {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    // Private browsing and blocked storage both land here; the conversation
    // simply will not persist across a reload.
    return null;
  }
};

export const writeSessionId = (sessionId: string): void => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch {
    /* non-fatal */
  }
};

export const clearSessionId = (): void => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    /* non-fatal */
  }
};

export const fetchAgentStatus = async (): Promise<AgentStatus> =>
  api.get<AgentStatus>("/agent/status");

export const sendAgentMessage = async (
  message: string,
  sessionId: string | null,
): Promise<AgentReply> => {
  const reply = await api.post<AgentReply>("/agent/chat", {
    message,
    ...(sessionId ? { sessionId } : {}),
  });
  if (reply?.sessionId) writeSessionId(reply.sessionId);
  return reply;
};

export interface AgentTranscript {
  sessionId: string;
  transcript: string;
  empty?: boolean;
}

/**
 * Pick a recording format this browser can actually produce.
 *
 * Chrome and Firefox give WebM/Opus; Safari only offers MP4/AAC. Asking for an
 * unsupported type makes MediaRecorder throw, so the type is negotiated rather
 * than assumed.
 */
export const pickAudioMimeType = (): string | null => {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
};

export const isVoiceSupported = (): boolean =>
  typeof navigator !== "undefined" &&
  Boolean(navigator.mediaDevices?.getUserMedia) &&
  pickAudioMimeType() !== null;

export const transcribeAudio = async (
  blob: Blob,
  sessionId: string | null,
): Promise<AgentTranscript> => {
  const form = new FormData();
  form.append("audio", blob, "speech");
  if (sessionId) form.append("sessionId", sessionId);

  const result = await api.post<AgentTranscript>("/agent/transcribe", form);
  if (result?.sessionId) writeSessionId(result.sessionId);
  return result;
};

export const resetAgentConversation = async (
  sessionId: string | null,
): Promise<void> => {
  await api.post<{ sessionId: string }>("/agent/reset", {
    ...(sessionId ? { sessionId } : {}),
  });
  clearSessionId();
};
