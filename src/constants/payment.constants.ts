export const COD_PAYMENT_CODE = "COD";
export const CARD_PAYMENT_CODE = "CARD";
export const UPI_PAYMENT_CODE = "UPI";
/** @deprecated Legacy admin mode — treat same as online gateway */
export const LEGACY_RAZORPAY_PAYMENT_CODE = "RAZORPAY";

export const ONLINE_CHECKOUT_PAYMENT_CODES = [
  CARD_PAYMENT_CODE,
  UPI_PAYMENT_CODE,
] as const;

export const ONLINE_GATEWAY_PAYMENT_CODES = [
  CARD_PAYMENT_CODE,
  UPI_PAYMENT_CODE,
  LEGACY_RAZORPAY_PAYMENT_CODE,
] as const;

export type OnlineCheckoutPaymentCode = (typeof ONLINE_CHECKOUT_PAYMENT_CODES)[number];

export const ONLINE_PAYMENT_CHECKOUT_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

export const MAGIC_CHECKOUT_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/magic-checkout.js";

export const ONLINE_PAYMENT_MERCHANT_NAME = "Faithful Meat";

export function isOnlineCheckoutPaymentCode(code: string): boolean {
  return ONLINE_CHECKOUT_PAYMENT_CODES.includes(
    code.toUpperCase() as OnlineCheckoutPaymentCode,
  );
}

export function isOnlineGatewayPaymentCode(code: string): boolean {
  return ONLINE_GATEWAY_PAYMENT_CODES.includes(
    code.toUpperCase() as (typeof ONLINE_GATEWAY_PAYMENT_CODES)[number],
  );
}

export function getCheckoutButtonLabel(paymentMethod: string): string {
  const code = paymentMethod.toUpperCase();
  if (code === COD_PAYMENT_CODE) return "Place order";
  if (code === UPI_PAYMENT_CODE) return "Pay now";
  if (code === CARD_PAYMENT_CODE) return "Pay now";
  return "Continue to payment";
}

export function getPaymentMethodHelperText(paymentMethod: string): string | null {
  const code = paymentMethod.toUpperCase();
  if (code === COD_PAYMENT_CODE) return "Pay when your order is delivered.";
  if (code === UPI_PAYMENT_CODE) {
    return "Pay securely via UPI, cards, wallets, and more in the payment window.";
  }
  if (code === CARD_PAYMENT_CODE) {
    return "Pay securely in the payment window.";
  }
  return null;
}
