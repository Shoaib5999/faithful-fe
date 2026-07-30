import { api } from "@/services/api";
import type { ShippingMethod, ShippingSettings } from "@/types/master.types";

export const fetchShippingSettings = async (): Promise<ShippingSettings> => {
  return api.get<ShippingSettings>("/shipping/config/settings");
};

export const updateShippingSettings = async (
  input: Pick<ShippingSettings, "defaultShippingFee" | "freeShippingThreshold" | "isFreeShippingEnabled">,
): Promise<ShippingSettings> => {
  return api.put<ShippingSettings>("/shipping/config/settings", input);
};

export const fetchShippingMethods = async (includeInactive = false): Promise<ShippingMethod[]> => {
  return api.get<ShippingMethod[]>(
    "/shipping/config/methods",
    includeInactive ? { includeInactive: "true" } : undefined,
  );
};

export const createShippingMethod = async (
  input: Omit<ShippingMethod, "id">,
): Promise<ShippingMethod> => {
  return api.post<ShippingMethod>("/shipping/config/methods", input);
};

export const updateShippingMethod = async (
  id: string,
  input: Partial<Omit<ShippingMethod, "id">>,
): Promise<ShippingMethod> => {
  return api.put<ShippingMethod>(`/shipping/config/methods/${id}`, input);
};

export const deleteShippingMethod = async (id: string): Promise<void> => {
  await api.delete(`/shipping/config/methods/${id}`);
};
