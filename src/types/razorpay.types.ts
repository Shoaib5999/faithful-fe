export type RazorpayCreateOrderResponse = {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  orderId?: string;
  paymentMethod?: string;
};

export type OnlineCheckoutPrepareInput = {
  addressId?: string;
  paymentMethod: string;
  couponCode?: string;
  shippingMethodCode?: string;
};

export type GuestCheckoutCartItem = {
  variantId: string;
  quantity: number;
};

export type GuestCheckoutPrepareInput = {
  items: GuestCheckoutCartItem[];
  paymentMethod: string;
  couponCode?: string;
  shippingMethodCode?: string;
};

export type GuestCheckoutCompleteInput = {
  paymentMethod: string;
  couponCode?: string;
  shippingMethodCode?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  notes?: string;
};

export type GuestCheckoutCompleteResponse = {
  order: {
    id: string;
    subtotal: string | number;
    discount: string | number;
    shippingCharge: string | number;
    total: string | number;
    status?: { code: string };
    createdAt?: string;
  };
  email: string;
  isNewAccount: boolean;
};

export type OnlineCheckoutPrepareResponse = {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  paymentMethod: string;
  checkoutMode?: "magic" | "standard";
};

export type OnlineCheckoutCompleteInput = {
  addressId?: string;
  paymentMethod: string;
  couponCode?: string;
  shippingMethodCode?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  notes?: string;
};

export type RazorpayVerifyPaymentInput = {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayCheckoutPrefill = {
  name?: string;
  email?: string;
  contact?: string;
  coupon_code?: string;
  prediscount?: Array<{
    label: string;
    value: string;
  }>;
};

import type { OnlineCheckoutPaymentCode } from "@/constants/payment.constants";

export type OpenRazorpayCheckoutInput = {
  keyId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  name?: string;
  description?: string;
  prefill?: RazorpayCheckoutPrefill;
  paymentMethod?: OnlineCheckoutPaymentCode;
  checkoutMode?: "magic" | "standard";
  appliedCouponCode?: string;
  appliedCouponDiscountPaise?: number;
};

export type RazorpayCheckoutResult =
  | { status: "success"; response: RazorpaySuccessResponse }
  | { status: "dismissed" }
  | { status: "failed"; message: string };

export type RazorpayStandardCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  order_id: string;
  prefill?: RazorpayCheckoutPrefill;
  config?: Record<string, unknown>;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

export type RazorpayMagicCheckoutOptions = {
  key: string;
  one_click_checkout: true;
  name: string;
  order_id: string;
  show_coupons?: boolean;
  prefill?: RazorpayCheckoutPrefill;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

export type RazorpayCheckoutOptions =
  | RazorpayStandardCheckoutOptions
  | RazorpayMagicCheckoutOptions;

export type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (event: RazorpayFailedEvent) => void) => void;
};

export type RazorpayFailedEvent = {
  error?: {
    description?: string;
    reason?: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

export {};
