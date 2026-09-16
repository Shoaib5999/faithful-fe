import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, RotateCcw, Send, X } from "lucide-react";

import { useCartActions } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import {
  fetchAgentStatus,
  readSessionId,
  resetAgentConversation,
  sendAgentMessage,
  type AgentClientAction,
} from "@/services/agent-service";

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

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
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
  }, [input, sending]);

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

  const reset = useCallback(async () => {
    await resetAgentConversation(readSessionId()).catch(() => undefined);
    setMessages([{ id: "greeting", role: "assistant", text: GREETING }]);
  }, []);

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
              placeholder="Ask about any cut, price or order…"
              maxLength={2000}
              className="min-w-0 flex-1 rounded-full border border-black/15 px-4 py-2.5 font-store-body text-[13px] outline-none focus:border-[var(--store-red)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
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
