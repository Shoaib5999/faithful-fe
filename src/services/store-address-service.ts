import { api } from "@/services/api";

export type StoreAddressApi = {
  id: string;
  userId: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  /** Captured via browser geolocation at address entry — no maps/geocoding provider involved. */
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreAddressInput = {
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

export async function fetchStoreAddresses(): Promise<StoreAddressApi[]> {
  return api.get<StoreAddressApi[]>("/addresses");
}

export async function createStoreAddress(body: StoreAddressInput): Promise<StoreAddressApi> {
  return api.post<StoreAddressApi>("/addresses", body);
}

export async function updateStoreAddress(
  id: string,
  body: Partial<StoreAddressInput>,
): Promise<StoreAddressApi> {
  return api.put<StoreAddressApi>(`/addresses/${id}`, body);
}

export async function deleteStoreAddress(id: string): Promise<void> {
  await api.delete<unknown>(`/addresses/${id}`);
}

export async function setDefaultStoreAddress(id: string): Promise<StoreAddressApi> {
  return api.patch<StoreAddressApi>(`/addresses/${id}/default`, {});
}
