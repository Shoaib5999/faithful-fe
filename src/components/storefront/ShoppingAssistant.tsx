import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  MessageCircle,
  Mic,
  RotateCcw,
  Send,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { useCartActions } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import {
  fetchAgentStatus,
  isVoiceSupported,
  readSessionId,
  resetAgentConversation,
  sendAgentMessage,
  transcribeAudio,
  type AgentClientAction,
} from "@/services/agent-service";
import { useSpeech } from "@/hooks/useSpeech";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

/**
 * Floating shopping assistant.
 *
 * Renders nothing at all unless the backend reports the assistant as
 * configured, so switching it off server-side removes it from the storefront
 * without a redeploy.
 */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** Guest cart additions the agent proposed but could not perform itself. */
  actions?: AgentClientAction[];
  failed?: boolean;
}

const GREETING =
  "Hi! I can help you find cuts, check prices, or track an order. What are you after?";

const newId = () => Math.random().toString(36).slice(2, 10);

export function ShoppingAssistant() {
  const { addItem, openCart } = useCartActions();

  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [applyingAction, setApplyingAction] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "greeting", role: "assistant", text: GREETING },
  ]);

  const [transcribing, setTranscribing] = useState(false);
  const [voiceSupported] = useState(() => isVoiceSupported());

  const recorder = useVoiceRecorder();
  const speech = useSpeech();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchAgentStatus()
      .then((status) => {
        if (!cancelled) setAvailable(Boolean(status?.available));
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /**
   * `spoken` marks a turn that came from the microphone. Only those get read
   * back: speaking a reply to someone who typed would be startling, especially
   * if they are browsing somewhere quiet.
   */
  const send = useCallback(
    async (messageText?: string, spoken = false) => {
    const text = (messageText ?? input).trim();
    if (!text || sending) return;

    if (messageText === undefined) setInput("");
    setMessages((prev) => [...prev, { id: newId(), role: "user", text }]);
    setSending(true);

    try {
      const reply = await sendAgentMessage(text, readSessionId());
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          text: reply.reply,
          ...(reply.clientActions?.length ? { actions: reply.clientActions } : {}),
        },
      ]);
      if (spoken) speech.speak(reply.reply);
    } catch (err) {
      const status = (err as { status?: number })?.status;
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          failed: true,
          text:
            status === 429
              ? "I'm getting a lot of messages right now — give me a moment and try again."
              : "Sorry, I couldn't reach the assistant just then. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
    },
    [input, sending, speech],
  );

  /**
   * Apply a guest cart addition. The agent cannot write to a guest's cart, so it
   * proposes and the customer confirms here — which also keeps the addition an
   * explicit, human-initiated act.
   */
  const applyAction = useCallback(
    async (messageId: string, action: AgentClientAction) => {
      setApplyingAction(messageId);
      try {
        await addItem(
          {
            variantId: action.variantId,
            name: action.name,
            image: action.image,
            price: action.price,
            priceNumber: action.priceNumber,
            ...(action.notes ? { notes: action.notes } : {}),
            ...(action.categorySlug ? { categorySlug: action.categorySlug } : {}),
            ...(action.stockQty != null ? { stockQty: action.stockQty } : {}),
          },
          action.quantity,
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, actions: undefined, text: `${m.text}\n\nAdded to your cart.` }
              : m,
          ),
        );
        // Close the panel before opening the cart: on a phone this widget is
        // fullscreen, so leaving it open would completely hide the cart drawer
        // the customer was just sent to. The conversation is preserved.
        setOpen(false);
        openCart();
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            failed: true,
            text: "I couldn't add that to your cart. It may have just gone out of stock.",
          },
        ]);
      } finally {
        setApplyingAction(null);
      }
    },
    [addItem, openCart],
  );

  /**
   * Stop recording, transcribe, and send in one gesture.
   *
   * The transcript is shown as the customer's own message before the reply
   * arrives, so a misheard request is visible rather than silently answered.
   */
  const finishRecording = useCallback(async () => {
    const blob = await recorder.stop();
    if (!blob) return;

    // Transcription and the agent call are two separate waits, and the
    // "Transcribing…" indicator must end when transcription does — otherwise it
    // sits on screen alongside "Checking…" for the whole reply, implying the
    // recording is still being processed when it finished seconds earlier.
    let transcript: string;
    setTranscribing(true);
    try {
      ({ transcript } = await transcribeAudio(blob, readSessionId()));
    } catch (err) {
      const status = (err as { status?: number })?.status;
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          failed: true,
          text:
            status === 429
              ? "I'm getting a lot of messages right now — give me a moment and try again."
              : "I couldn't make out that recording. Please try again.",
        },
      ]);
      return;
    } finally {
      setTranscribing(false);
    }

    if (!transcript) {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          failed: true,
          text: "I didn't catch that. Try again, a little closer to the mic.",
        },
      ]);
      return;
    }

    await send(transcript, true);
  }, [recorder, send]);

  const toggleRecording = useCallback(() => {
    // Speaking over the assistant is the natural way to interrupt it.
    speech.stop();
    if (recorder.isRecording) void finishRecording();
    else void recorder.start();
  }, [recorder, finishRecording, speech]);

  // Surface recorder problems in the conversation rather than a silent no-op.
  useEffect(() => {
    if (!recorder.error) return;
    const text =
      recorder.error === "permission-denied"
        ? "I need microphone access to hear you. Enable it in your browser settings, or just type instead."
        : recorder.error === "unsupported"
          ? "Voice input isn't supported in this browser, but you can type."
          : "Something went wrong with the microphone. Please try again.";
    setMessages((prev) => [...prev, { id: newId(), role: "assistant", failed: true, text }]);
    recorder.clearError();
  }, [recorder]);

  const reset = useCallback(async () => {
    speech.stop();
    recorder.cancel();
    await resetAgentConversation(readSessionId()).catch(() => undefined);
    setMessages([{ id: "greeting", role: "assistant", text: GREETING }]);
  }, [speech, recorder]);

  if (!available) return null;

  return (
    <>
      {/* Launcher — sits above the WhatsApp button so the two never overlap. */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open shopping assistant"
          className="store-fab-assistant fixed right-5 z-[9998] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--store-red)] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl lg:right-9"
        >
          <MessageCircle className="h-7 w-7" strokeWidth={1.75} />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Shopping assistant"
          className={cn(
            "fixed z-[9999] flex flex-col overflow-hidden bg-white shadow-2xl",
            // Full screen on a phone, a panel on larger screens.
            "inset-0 rounded-none",
            "sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[560px] sm:max-h-[calc(100vh-3rem)] sm:w-[380px] sm:rounded-2xl",
          )}
        >
          <header className="flex items-center justify-between border-b border-black/10 bg-[var(--store-red)] px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="font-store-body text-sm font-semibold">Shopping Assistant</p>
              <p className="font-store-body text-[11px] text-white/70">
                Prices and stock are live
              </p>
            </div>
            <div className="flex items-center gap-1">
              {speech.supported && (
                <button
                  type="button"
                  onClick={speech.toggleEnabled}
                  aria-label={speech.enabled ? "Mute spoken replies" : "Unmute spoken replies"}
                  className="rounded-full p-2 transition-colors hover:bg-white/15"
                >
                  {speech.enabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={reset}
                aria-label="Start a new conversation"
                className="rounded-full p-2 transition-colors hover:bg-white/15"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close shopping assistant"
                className="rounded-full p-2 transition-colors hover:bg-white/15"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[var(--store-cream)] p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 font-store-body text-[13px] leading-relaxed",
                    message.role === "user"
                      ? "rounded-br-sm bg-[var(--store-red)] text-white"
                      : message.failed
                        ? "rounded-bl-sm border border-red-200 bg-red-50 text-red-800"
                        : "rounded-bl-sm border border-black/8 bg-white text-[var(--store-ink)]",
                  )}
                >
                  {message.text}

                  {message.actions?.map((action) => (
                    <button
                      key={action.variantId}
                      type="button"
                      disabled={applyingAction === message.id}
                      onClick={() => void applyAction(message.id, action)}
                      className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--store-red)] px-3 py-2 font-store-body text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {applyingAction === message.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      Add to cart
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {recorder.isRecording && (
              <div className="flex justify-end">
                <div className="flex items-center gap-2 rounded-2xl rounded-br-sm bg-[var(--store-red)] px-3.5 py-2.5 text-white">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                  </span>
                  <span className="font-store-body text-[13px]">
                    Listening… {recorder.elapsed}s
                  </span>
                </div>
              </div>
            )}

            {transcribing && (
              <div className="flex justify-end">
                <div className="flex items-center gap-2 rounded-2xl rounded-br-sm border border-black/8 bg-white px-3.5 py-2.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--store-red)]" />
                  <span className="font-store-body text-[13px] text-[var(--store-muted)]">
                    Transcribing…
                  </span>
                </div>
              </div>
            )}

            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-black/8 bg-white px-3.5 py-2.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--store-red)]" />
                  <span className="font-store-body text-[13px] text-[var(--store-muted)]">
                    Checking…
                  </span>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-center gap-2 border-t border-black/10 bg-white p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={recorder.isRecording ? "Listening…" : "Ask about any cut, price or order…"}
              maxLength={2000}
              disabled={recorder.isRecording || transcribing}
              className="min-w-0 flex-1 rounded-full border border-black/15 px-4 py-2.5 font-store-body text-[13px] outline-none focus:border-[var(--store-red)] disabled:bg-black/5"
            />

            {voiceSupported && (
              <button
                type="button"
                onClick={toggleRecording}
                disabled={sending || transcribing}
                aria-label={recorder.isRecording ? "Stop recording and send" : "Record a voice message"}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40",
                  recorder.isRecording
                    ? "bg-red-600 text-white"
                    : "border border-black/15 text-[var(--store-ink)] hover:border-[var(--store-red)] hover:text-[var(--store-red)]",
                )}
              >
                {recorder.isRecording ? (
                  <Square className="h-4 w-4 fill-current" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || sending || recorder.isRecording || transcribing}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--store-red)] text-white transition-opacity disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
