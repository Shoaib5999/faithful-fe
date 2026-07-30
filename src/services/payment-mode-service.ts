import type { PaymentMode } from "@/types/commerce.types";
import { api } from "./api";

/** Storefront — active payment modes only. */
export const fetchPaymentModes = async (): Promise<PaymentMode[]> => {
  const data = await api.get<PaymentMode[]>("/master/payment-modes");
  return data;
};

/** Admin Settings — includes inactive modes. */
export const fetchAdminPaymentModes = async (): Promise<PaymentMode[]> => {
  const data = await api.get<PaymentMode[]>("/master/payment-modes/admin");
  return data;
};

export const createPaymentMode = async (
  input: Omit<PaymentMode, "id">
): Promise<PaymentMode> => {
  const data = await api.post<PaymentMode>(
    "/master/payment-modes",
    input
  );
  return data;
};

export const updatePaymentMode = async (
  id: string,
  input: Partial<Omit<PaymentMode, "id">>
): Promise<PaymentMode> => {
  const data = await api.put<PaymentMode>(
    `/master/payment-modes/${id}`,
    input
  );
  return data;
};

export const deletePaymentMode = async (
  id: string
): Promise<void> => {
  await api.delete(`/master/payment-modes/${id}`);
};
