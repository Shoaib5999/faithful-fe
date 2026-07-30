import { api } from "@/services/api";
import type { StoreOrderPlaceResponse } from "@/services/store-customer-order-service";
import type {
  GuestCheckoutCompleteInput,
  GuestCheckoutCompleteResponse,
  GuestCheckoutPrepareInput,
  OnlineCheckoutCompleteInput,
  OnlineCheckoutPrepareInput,
  OnlineCheckoutPrepareResponse,
  RazorpayCreateOrderResponse,
  RazorpayVerifyPaymentInput,
} from "@/types/razorpay.types";

export async function fetchCheckoutConfig(): Promise<{ magicCheckoutEnabled: boolean }> {
  return api.get<{ magicCheckoutEnabled: boolean }>("/payments/checkout-config");
}

export async function prepareOnlineCheckout(
  body: OnlineCheckoutPrepareInput,
): Promise<OnlineCheckoutPrepareResponse> {
  return api.post<OnlineCheckoutPrepareResponse>("/payments/online/prepare", body);
}

export async function completeOnlineCheckout(
  body: OnlineCheckoutCompleteInput,
): Promise<StoreOrderPlaceResponse> {
  return api.post<StoreOrderPlaceResponse>("/payments/online/complete", body);
}

export async function prepareGuestOnlineCheckout(
  body: GuestCheckoutPrepareInput,
): Promise<OnlineCheckoutPrepareResponse> {
  return api.post<OnlineCheckoutPrepareResponse>("/payments/guest/prepare", body);
}

export async function completeGuestOnlineCheckout(
  body: GuestCheckoutCompleteInput,
): Promise<GuestCheckoutCompleteResponse> {
  return api.post<GuestCheckoutCompleteResponse>("/payments/guest/complete", body);
}

/** Legacy — complete payment for an existing unpaid order */
export async function createOnlinePaymentSession(
  orderId: string,
): Promise<RazorpayCreateOrderResponse> {
  return api.post<RazorpayCreateOrderResponse>("/payments/razorpay/create", { orderId });
}

export async function verifyOnlinePayment(body: RazorpayVerifyPaymentInput): Promise<unknown> {
  return api.post<unknown>("/payments/razorpay/verify", body);
}

/** @deprecated */
export const createRazorpayOrder = createOnlinePaymentSession;
/** @deprecated */
export const verifyRazorpayPayment = verifyOnlinePayment;
