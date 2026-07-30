import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ChevronDown, Loader2, Package, Search } from "lucide-react";
import { StoreSectionTitle, storePanelClass } from "@/components/storefront/storefront-ui";
import { useNotification } from "@/hooks/useNotification";
import { getErrorMessage } from "@/lib/error";
import { mapStoreOrders, STATUS_TONE_CLASS } from "@/lib/store-order-display";
import { cn } from "@/lib/utils";
import { StoreCancelOrderModal } from "@/components/storefront/StoreCancelOrderModal";
import { cancelStoreOrder, fetchMyOrders } from "@/services/store-customer-order-service";
import type { StoreOrderView } from "@/types/store-order.types";

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

function OrderCard({
  order,
  open,
  cancelling,
  onToggle,
  onCancel,
}: {
  order: StoreOrderView;
  open: boolean;
  cancelling: boolean;
  onToggle: () => void;
  onCancel: () => void;
}) {
  const showCancel = canCancelStoreOrder(order);
  const tone = STATUS_TONE_CLASS[order.status.tone];
  const placedLabel = `${order.placedDateLabel} · ${order.placedTimeLabel}`;
  const firstItem = order.items[0];
  const moreItems = order.items.length - 1;

  return (
    <article className={cn(storePanelClass, "overflow-hidden")}>
      <div className="flex gap-4 px-5 py-4">
        {firstItem ? (
          <div className="hidden h-16 w-14 shrink-0 overflow-hidden rounded-sm border border-black/5 bg-[var(--store-cream)] sm:block">
            <img
              src={firstItem.imageUrl}
              alt={firstItem.name}
              className="h-full w-full object-contain p-1"
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 font-store-body text-[10px] font-semibold uppercase tracking-[0.1em]",
                    tone.badge,
                  )}
                >
                  {order.status.label}
                </span>
                <span className="font-store-body text-xs text-[var(--store-muted)]">
                  #{order.orderNumber}
                </span>
              </div>
              <p className="mt-1.5 font-store-body text-sm text-[var(--store-muted)]">{placedLabel}</p>
              {!open && firstItem ? (
                <p className="mt-1 truncate font-store-body text-sm text-[var(--store-ink)]">
                  {firstItem.name}
                  {moreItems > 0 ? (
                    <span className="text-[var(--store-muted)]">{` +${moreItems} more`}</span>
                  ) : null}
                </p>
              ) : null}
              <p className="mt-1 font-store-body text-xs text-[var(--store-muted)]">
                {order.itemCount} item{order.itemCount === 1 ? "" : "s"} · {order.paymentMethod}
              </p>
            </div>

            <p className="shrink-0 font-store-body text-base font-semibold text-[var(--store-ink)]">
              {order.totalLabel}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {showCancel ? (
              <button
                type="button"
                disabled={cancelling}
                onClick={onCancel}
                className="inline-flex items-center justify-center rounded-md border border-red-200 px-3 py-1.5 font-store-body text-[11px] font-semibold uppercase tracking-[0.1em] text-red-800 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {cancelling ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                ) : (
                  "Cancel"
                )}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-1 rounded-md border border-black/15 px-3 py-1.5 font-store-body text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--store-ink)] transition-colors hover:bg-[var(--store-cream)]/50"
            >
              {open ? "Hide details" : "View details"}
              <ChevronDown
                className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
              />
            </button>
          </div>
        </div>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-black/10 bg-[var(--store-cream)]/30 px-5 py-4">
            <ul className={cn(storePanelClass, "divide-y divide-black/10 overflow-hidden")}>
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3"
                >
                  {item.productSlug ? (
                    <Link
                      to={`/product/${item.productSlug}`}
                      className="group flex min-w-0 flex-1 gap-3"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-14 w-12 shrink-0 bg-[#fafafa] object-contain p-1 transition-opacity group-hover:opacity-75"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-store-body text-sm font-semibold text-[#1a1a1a] group-hover:text-[#b8954a]">
                          {item.name}
                        </p>
                        {item.variantLabel ? (
                          <p className="mt-0.5 font-store-body text-[11px] text-[#6b6b6b]">
                            {item.variantLabel}
                          </p>
                        ) : null}
                        <p className="mt-1 font-store-body text-[11px] text-[#6b6b6b]">
                          Qty {item.qty}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex min-w-0 flex-1 gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-14 w-12 shrink-0 bg-[#fafafa] object-contain p-1"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-store-body text-sm font-semibold text-[#1a1a1a]">
                          {item.name}
                        </p>
                        {item.variantLabel ? (
                          <p className="mt-0.5 font-store-body text-[11px] text-[#6b6b6b]">
                            {item.variantLabel}
                          </p>
                        ) : null}
                        <p className="mt-1 font-store-body text-[11px] text-[#6b6b6b]">
                          Qty {item.qty}
                        </p>
                      </div>
                    </div>
                  )}
                  <p className="shrink-0 pl-[calc(3rem+0.75rem)] font-store-body text-sm font-semibold text-[#1a1a1a] sm:pl-0">
                    {item.lineTotalLabel}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <OrderProgress order={order} />
            </div>

            <div className="mt-4 space-y-2 font-store-body text-sm">
              <div className="flex justify-between text-[#6b6b6b]">
                <span>Subtotal</span>
                <span className="text-[#1a1a1a]">{order.subtotalLabel}</span>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>Discount</span>
                  <span className="text-emerald-700">−{order.discountLabel}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-[#6b6b6b]">
                <span>Shipping</span>
                <span className="text-[#1a1a1a]">
                  {order.shippingCharge > 0 ? order.shippingLabel : "Free"}
                </span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 font-semibold text-[#1a1a1a]">
                <span>Total</span>
                <span>{order.totalLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AccountOrders() {
  const queryClient = useQueryClient();
  const { notify } = useNotification();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["orders", "my"],
    queryFn: () => fetchMyOrders({ limit: 50, page: 1 }),
  });

  const orders = useMemo(() => mapStoreOrders(data?.orders ?? []), [data]);

  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<StoreOrderView | null>(null);

  const filtered = orders.filter((order) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q) ||
      order.items.some((item) => item.name.toLowerCase().includes(q))
    );
  });

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    setCancellingOrderId(orderToCancel.id);
    try {
      const result = await cancelStoreOrder(orderToCancel.id);
      if (result.paymentStatus === "REFUNDED") {
        notify("Order cancelled. Refund initiated to your payment method.", "success");
      } else {
        notify("Order cancelled.", "success");
      }
      setOrderToCancel(null);
      await queryClient.invalidateQueries({ queryKey: ["orders", "my"] });
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div>
      <StoreSectionTitle
        title="My Orders"
        subtitle="Track deliveries and view your order history."
      />

      <div className={cn(storePanelClass, "mb-6 flex items-center gap-3 px-4 py-3 focus-within:border-[var(--store-red)] focus-within:shadow-[0_0_0_3px_rgba(184,149,74,0.12)]")}>
        <Search className="h-4 w-4 shrink-0 text-[var(--store-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order number or product…"
          className="flex-1 bg-transparent font-store-body text-sm text-[var(--store-ink)] outline-none placeholder:text-[var(--store-muted)]/70"
        />
      </div>

      <div className="space-y-3">
        {isPending ? (
          <div className={cn(storePanelClass, "flex justify-center py-16")}>
            <Loader2 className="h-7 w-7 animate-spin text-[var(--store-muted)]" aria-hidden />
          </div>
        ) : isError ? (
          <div className={cn(storePanelClass, "py-16 text-center")}>
            <AlertCircle className="mx-auto mb-3 h-7 w-7 text-[#c45c5c]" />
            <p className="font-store-body text-sm text-[#c45c5c]">
              Could not load orders. Please try again later.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 font-store-body text-xs font-semibold uppercase tracking-[0.12em] text-[var(--store-red)] hover:text-[var(--store-ink)]"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className={cn(storePanelClass, "py-16 text-center")}>
            <Package className="mx-auto mb-3 h-7 w-7 text-[var(--store-muted)]/50" />
            <p className="font-store-body text-sm text-[var(--store-muted)]">
              {orders.length === 0 ? "You have no orders yet." : "No orders match that search."}
            </p>
          </div>
        ) : (
          filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              open={open === order.id}
              cancelling={cancellingOrderId === order.id}
              onToggle={() => setOpen(open === order.id ? null : order.id)}
              onCancel={() => setOrderToCancel(order)}
            />
          ))
        )}
      </div>

      <StoreCancelOrderModal
        open={orderToCancel !== null}
        order={orderToCancel}
        confirming={cancellingOrderId === orderToCancel?.id}
        onClose={() => {
          if (cancellingOrderId !== orderToCancel?.id) setOrderToCancel(null);
        }}
        onConfirm={() => void handleConfirmCancel()}
      />
    </div>
  );
}
