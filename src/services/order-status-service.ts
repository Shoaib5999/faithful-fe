import type { OrderStatus } from "@/types/master.types";
import { api } from "./api";

export const fetchOrderStatuses = async (): Promise<OrderStatus[]> => {
  const data = await api.get("/master/order-statuses") as OrderStatus[];
  return data;
};

export const createOrderStatus = async (
  input: Omit<OrderStatus, "id">
): Promise<OrderStatus> => {
  const data = await api.post("/master/order-statuses", input) as OrderStatus;
  return data;
};

export const updateOrderStatus = async (
  id: string,
  input: Partial<Omit<OrderStatus, "id">>
): Promise<OrderStatus> => {
  const data = await api.put(`/master/order-statuses/${id}`, input) as OrderStatus;
  return data;
};

export const deleteOrderStatus = async (id: string): Promise<void> => {
  await api.delete(`/master/order-statuses/${id}`);
};

export const reorderOrderStatuses = async (
  orderedIds: string[]
): Promise<OrderStatus[]> => {
  const data = await api.put(
    "/master/order-statuses/reorder",
    { orderedIds }
  ) as OrderStatus[];

  return data;
};