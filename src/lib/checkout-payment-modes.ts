import {
  CARD_PAYMENT_CODE,
  COD_PAYMENT_CODE,
  UPI_PAYMENT_CODE,
} from "@/constants/payment.constants";
import type { PaymentMode } from "@/types/commerce.types";

/** Web checkout — active modes excluding Card (legacy; Razorpay covers all methods via UPI). */
export const selectCheckoutPaymentModes = (modes: PaymentMode[]): PaymentMode[] =>
  modes
    .filter((mode) => mode.isActive)
    .filter((mode) => mode.code.toUpperCase() !== CARD_PAYMENT_CODE)
    .sort((a, b) => a.sortOrder - b.sortOrder);

const CHECKOUT_PAYMENT_DISPLAY_ORDER = [
  UPI_PAYMENT_CODE,
  COD_PAYMENT_CODE,
] as const;

const checkoutPaymentDisplayRank = (code: string): number => {
  const index = CHECKOUT_PAYMENT_DISPLAY_ORDER.indexOf(
    code as (typeof CHECKOUT_PAYMENT_DISPLAY_ORDER)[number],
  );
  return index === -1 ? CHECKOUT_PAYMENT_DISPLAY_ORDER.length : index;
};

export const getDefaultCheckoutPaymentCode = (modes: PaymentMode[]): string => {
  if (modes.length === 0) return "";
  const upi = modes.find((mode) => mode.code === UPI_PAYMENT_CODE);
  return upi?.code ?? modes[0].code;
};

/** Checkout display order: UPI, then COD. */
export const sortCheckoutPaymentModesForDisplay = (modes: PaymentMode[]): PaymentMode[] =>
  [...modes].sort((a, b) => {
    const rankDiff = checkoutPaymentDisplayRank(a.code) - checkoutPaymentDisplayRank(b.code);
    if (rankDiff !== 0) return rankDiff;
    return a.sortOrder - b.sortOrder;
  });
