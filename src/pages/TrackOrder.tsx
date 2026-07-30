import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, Loader2, Package } from "lucide-react";
import { StoreCancelOrderModal } from "@/components/storefront/StoreCancelOrderModal";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { StorePageTitle } from "@/components/storefront/StorePageTitle";
import {
  StoreFormLabel,
  StoreInput,
  StorePageContainer,
  StorePrimaryButton,
  storePageSectionClass,
  storePanelClass,
} from "@/components/storefront/storefront-ui";
import { useNotification } from "@/hooks/useNotification";
import { getErrorMessage } from "@/lib/error";
import { formatStoreOrderNumber, mapStoreOrders, STATUS_TONE_CLASS } from "@/lib/store-order-display";
import { cn } from "@/lib/utils";
import {
  cancelTrackedStoreOrder,
  trackStoreOrder,
} from "@/services/store-customer-order-service";
import type { StoreOrderApi, StoreOrderView } from "@/types/store-order.types";

const NON_CANCELLABLE_STATUSES = new Set(["CANCELLED", "DELIVERED", "RETURNED"]);

function canCancelStoreOrder(order: StoreOrderView): boolean {
  return !NON_CANCELLABLE_STATUSES.has(order.orderStatusCode.toUpperCase());
}

function OrderProgress({ order }: { order: StoreOrderView }) {
  const { status } = order;
  const tone = STATUS_TONE_CLASS[status.tone];

  if (!status.showDeliveryProgress) return null;

  const steps = ["Confirmed", "Shipped", "Delivered"];
  const progressPct = Math.round((status.progressStep / status.progressMax) * 100);

  return (
    <div>
      <div className="relative mt-1 h-1 overflow-hidden rounded-full bg-[#f0ebe3]">
        <div
          className={cn("absolute inset-y-0 left-0 transition-all duration-700", tone.bar)}
          style={{ width: `${Math.max(progressPct, status.progressStep > 0 ? 12 : 4)}%` }}
        />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1 font-store-body text-[10px] uppercase tracking-wide text-[#6b6b6b]">
        {steps.map((step, index) => (
          <span
            key={step}
            className={cn(
              index === 0 ? "text-left" : index === steps.length - 1 ? "text-right" : "text-center",
              status.progressStep > index && "font-semibold text-[#1a1a1a]",
            )}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderIdInput, setOrderIdInput] = useState(searchParams.get("orderId") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderApi, setOrderApi] = useState<StoreOrderApi | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<StoreOrderView | null>(null);
  const [cancelEmail, setCancelEmail] = useState("");

  const order = useMemo(
    () => (orderApi ? mapStoreOrders([orderApi])[0] ?? null : null),
    [orderApi],
  );

  const loadOrder = async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await trackStoreOrder(orderId.trim());
      setOrderApi(result);
      setSearchParams({ orderId: formatStoreOrderNumber(result.id) });
      setOrderIdInput(formatStoreOrderNumber(result.id));
    } catch (err) {
      setOrderApi(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const orderId = searchParams.get("orderId")?.trim();
    if (!orderId) return;
    setOrderIdInput(orderId);
    void loadOrder(orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!orderIdInput.trim()) {
      notify("Enter your order ID from the confirmation email (e.g. #A1B2C3D4).", "error");
      return;
    }
    void loadOrder(orderIdInput);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    setCancelling(true);
    try {
      const result = await cancelTrackedStoreOrder(
        orderToCancel.orderNumber,
        cancelEmail.trim(),
      );
      if (result.paymentStatus === "REFUNDED") {
        notify("Order cancelled. Refund initiated to your payment method.", "success");
      } else {
        notify("Order cancelled.", "success");
      }
      setOrderToCancel(null);
      setCancelEmail("");
      await loadOrder(orderToCancel.orderNumber);
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setCancelling(false);
    }
  };

  const tone = order ? STATUS_TONE_CLASS[order.status.tone] : null;

  return (
    <StorePageShell>
      <StorePageTitle title="Track Order" />
      <StorePageContainer className={cn(storePageSectionClass, "mx-auto max-w-2xl")}>
        <p className="font-store-body text-sm text-[var(--store-muted)]">
          Enter the order ID from your email (e.g. #A1B2C3D4).
        </p>

        <form
          onSubmit={handleSubmit}
          className={cn(storePanelClass, "mt-6 space-y-4 p-5 md:p-6")}
        >
          <div>
            <StoreFormLabel>Order ID</StoreFormLabel>
            <StoreInput
              id="track-order-id"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
              placeholder="#A1B2C3D4"
              className="mt-2"
              aria-label="Order ID"
            />
          </div>
          <StorePrimaryButton type="submit" disabled={loading} className="w-full py-3">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Looking up order…
              </span>
            ) : (
              "Track order"
            )}
          </StorePrimaryButton>
        </form>

        {error ? (
          <div className={cn(storePanelClass, "mt-6 flex items-start gap-3 p-5 text-red-700")}>
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="font-store-body text-sm">{error}</p>
          </div>
        ) : null}

        {order && tone ? (
          <article className={cn(storePanelClass, "mt-6 overflow-hidden")}>
            <div className="border-b border-black/10 px-5 py-4 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-store-body text-xs uppercase tracking-[0.12em] text-[var(--store-muted)]">
                    Order #{order.orderNumber}
                  </p>
                  <p className="mt-1 font-store-body text-sm text-[var(--store-muted)]">
                    {order.placedDateLabel} · {order.placedTimeLabel}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 font-store-body text-[10px] font-semibold uppercase tracking-[0.1em]",
                    tone.badge,
                  )}
                >
                  {order.status.label}
                </span>
              </div>
              <div className="mt-4">
                <OrderProgress order={order} />
              </div>
            </div>

            <ul className="divide-y divide-black/10">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 px-5 py-4 md:px-6">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-16 w-14 shrink-0 bg-[var(--store-cream)] object-contain p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-store-body text-sm font-semibold text-[var(--store-ink)]">
                      {item.name}
                    </p>
                    <p className="mt-1 font-store-body text-[11px] text-[var(--store-muted)]">
                      Qty {item.qty} · {item.lineTotalLabel}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-black/10 px-5 py-4 font-store-body text-sm md:px-6">
              <div className="flex justify-between text-[var(--store-muted)]">
                <span>Subtotal</span>
                <span>{order.subtotalLabel}</span>
              </div>
              <div className="flex justify-between text-[var(--store-muted)]">
                <span>Shipping</span>
                <span>{order.shippingLabel}</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-3 font-semibold text-[var(--store-ink)]">
                <span>Total</span>
                <span>{order.totalLabel}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-black/10 px-5 py-4 md:px-6">
              {canCancelStoreOrder(order) ? (
                <button
                  type="button"
                  onClick={() => {
                    setCancelEmail("");
                    setOrderToCancel(order);
                  }}
                  disabled={cancelling}
                  className="inline-flex items-center justify-center rounded-md border border-red-200 px-3 py-1.5 font-store-body text-[11px] font-semibold uppercase tracking-[0.1em] text-red-800 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  Cancel order
                </button>
              ) : null}
              <Link
                to="/collection"
                className="inline-flex items-center gap-1 rounded-md border border-black/15 px-3 py-1.5 font-store-body text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--store-ink)] transition-colors hover:bg-[var(--store-cream)]/50"
              >
                Continue shopping
              </Link>
            </div>
          </article>
        ) : null}

        {!loading && !error && !order ? (
          <div className={cn(storePanelClass, "mt-6 py-12 text-center")}>
            <Package className="mx-auto mb-3 h-7 w-7 text-[var(--store-muted)]/50" />
            <p className="font-store-body text-sm text-[var(--store-muted)]">
              Your order details will appear here.
            </p>
          </div>
        ) : null}
      </StorePageContainer>

      <StoreCancelOrderModal
        open={Boolean(orderToCancel)}
        order={orderToCancel}
        confirming={cancelling}
        requireEmail
        cancelEmail={cancelEmail}
        onCancelEmailChange={setCancelEmail}
        onClose={() => {
          if (!cancelling) {
            setOrderToCancel(null);
            setCancelEmail("");
          }
        }}
        onConfirm={() => void handleConfirmCancel()}
      />
    </StorePageShell>
  );
}
