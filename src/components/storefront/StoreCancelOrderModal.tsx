import { Loader2, X } from "lucide-react";
import { isOnlineGatewayPaymentCode } from "@/constants/payment.constants";
import {
  StoreFormLabel,
  StoreInput,
} from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";
import type { StoreOrderView } from "@/types/store-order.types";

type StoreCancelOrderModalProps = {
  open: boolean;
  order: StoreOrderView | null;
  confirming: boolean;
  requireEmail?: boolean;
  cancelEmail?: string;
  onCancelEmailChange?: (email: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

function getCancelDescription(order: StoreOrderView): string {
  const isOnlinePaid =
    isOnlineGatewayPaymentCode(order.paymentMethodCode) &&
    order.paymentStatus === "PAID";

  if (isOnlinePaid) {
    return `${order.totalLabel} will be refunded to your original payment method. This usually takes 5–7 business days.`;
  }

  return "This action cannot be undone. Your order will be cancelled.";
}

export function StoreCancelOrderModal({
  open,
  order,
  confirming,
  requireEmail = false,
  cancelEmail = "",
  onCancelEmailChange,
  onClose,
  onConfirm,
}: StoreCancelOrderModalProps) {
  if (!open || !order) return null;

  const handleBackdrop = () => {
    if (!confirming) onClose();
  };

  const emailMissing = requireEmail && !cancelEmail.trim();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={handleBackdrop}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md border border-black/10 bg-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
      >
        <div className="flex items-start justify-between border-b border-black/10 p-5 md:p-6">
          <div>
            <p className="font-store-body text-xs font-semibold uppercase tracking-[0.14em] text-[#6b6b6b]">
              Cancel order
            </p>
            <h3
              id="cancel-order-title"
              className="mt-1  text-xl font-bold uppercase tracking-wide text-[#1a1a1a]"
            >
              Order #{order.orderNumber}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="p-2 text-[#6b6b6b] hover:text-[#1a1a1a] disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5 md:p-6">
          <p className="font-store-body text-sm leading-relaxed text-[#6b6b6b]">
            Are you sure you want to cancel this order?
          </p>
          <p className="font-store-body text-sm leading-relaxed text-[#1a1a1a]">
            {getCancelDescription(order)}
          </p>
          {requireEmail ? (
            <div>
              <StoreFormLabel>Order email</StoreFormLabel>
              <StoreInput
                id="cancel-order-email"
                type="email"
                value={cancelEmail}
                onChange={(e) => onCancelEmailChange?.(e.target.value)}
                placeholder="Email used at checkout"
                className="mt-2"
                disabled={confirming}
              />
            </div>
          ) : null}
          <div className="flex justify-between border border-black/10 bg-[#fafafa] px-4 py-3 font-store-body text-sm">
            <span className="text-[#6b6b6b]">Order total</span>
            <span className="font-semibold text-[#1a1a1a]">{order.totalLabel}</span>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-black/10 p-5 sm:flex-row sm:justify-end md:p-6">
          <button
            type="button"
            disabled={confirming}
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-md border border-black/15 px-4 py-2.5 font-store-body text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a] transition-colors hover:bg-[#fafafa] disabled:opacity-50 sm:w-auto"
          >
            Keep order
          </button>
          <button
            type="button"
            disabled={confirming || emailMissing}
            onClick={onConfirm}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 font-store-body text-[11px] font-semibold uppercase tracking-[0.1em] text-red-800 transition-colors hover:bg-red-100 disabled:opacity-50 sm:w-auto",
            )}
          >
            {confirming ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Cancelling…
              </>
            ) : (
              "Yes, cancel order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
