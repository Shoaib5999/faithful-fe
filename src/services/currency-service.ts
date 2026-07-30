import type { Currency } from "@/types/master.types";
import { api } from "./api";

export const fetchCurrencies = async (): Promise<Currency[]> => {
  return api.get<Currency[]>("/master/currencies");
};

export const createCurrency = async (
  input: Omit<Currency, "id">
): Promise<Currency> => {
  return api.post<Currency>("/master/currencies", input);
};

export const updateCurrency = async (
  id: string,
  input: Partial<Omit<Currency, "id">>
): Promise<Currency> => {
  return api.put<Currency>(`/master/currencies/${id}`, input);
};

export const deleteCurrency = async (id: string): Promise<void> => {
  return api.delete(`/master/currencies/${id}`);
};