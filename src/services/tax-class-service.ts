import type { TaxClass } from "@/types/master.types";
import { api } from "./api";

export const fetchTaxClasses = async (): Promise<TaxClass[]> => {
  const data = await api.get("/master/tax-classes") as TaxClass[];
  return data;
};

export const createTaxClass = async (
  input: Omit<TaxClass, "id">
): Promise<TaxClass> => {
  const data = await api.post("/master/tax-classes", input) as TaxClass;
  return data;
};

export const updateTaxClass = async (
  id: string,
  input: Partial<Omit<TaxClass, "id">>
): Promise<TaxClass> => {
  const data = await api.put(`/master/tax-classes/${id}`, input) as TaxClass;
  return data;
};

export const deleteTaxClass = async (id: string): Promise<void> => {
  await api.delete(`/master/tax-classes/${id}`);
};