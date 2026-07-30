import { api } from "@/services/api";
import type { StoreOrderApi, StoreOrderPaymentStatus } from "@/types/store-order.types";

export type StorePaymentMethodCode = string;

export type PlaceStoreOrderInput = {
  addressId: string;
  paymentMethod: StorePaymentMethodCode;
  couponCode?: string;
  shippingMethodCode?: string;
  notes?: string;
};

export type StoreOrderPlaceResponse = {
  id: string;
  subtotal: string | number;
  discount: string | number;
  shippingCharge: string | number;
  total: string | number;
  status?: { code: string };
  createdAt?: string;
};

export async function placeStoreOrder(
  body: PlaceStoreOrderInput,
): Promise<StoreOrderPlaceResponse> {
  return api.post<StoreOrderPlaceResponse>("/orders", body);
}

export type StoreMyOrderList = {
  orders: StoreOrderApi[];
  total: number;
  page: number;
  totalPages: number;
};

export async function fetchMyOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<StoreMyOrderList> {
  return api.get<StoreMyOrderList>("/orders/my", params);
}

export async function fetchMyOrderById(id: string): Promise<unknown> {
  return api.get<unknown>(`/orders/my/${id}`);
}

export type CancelStoreOrderResponse = {
  paymentStatus?: StoreOrderPaymentStatus;
  status?: { code?: string };
};

export async function cancelStoreOrder(
  orderId: string,
  reason?: string,
): Promise<CancelStoreOrderResponse> {
  return api.patch<CancelStoreOrderResponse>(`/orders/my/${orderId}/cancel`, {
    reason: reason ?? "Cancelled by customer",
  });
}

export async function trackStoreOrder(orderId: string): Promise<StoreOrderApi> {
  return api.post<StoreOrderApi>("/orders/track", { orderId });
}

export async function cancelTrackedStoreOrder(
  orderId: string,
  email: string,
  reason?: string,
): Promise<CancelStoreOrderResponse> {
  return api.patch<CancelStoreOrderResponse>(`/orders/track/${orderId}/cancel`, {
    email,
    reason: reason ?? "Cancelled by customer",
  });
}
