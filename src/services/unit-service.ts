import type { Unit } from "@/types/master.types";
import { api } from "@/services/api";

export const fetchUnits = async (): Promise<Unit[]> => {
  const data = await api.get<Unit[]>("/master/units");
  return data;
};

export const createUnit = async (
  input: Omit<Unit, "id" | "createdAt">
): Promise<Unit> => {
  const data = await api.post<Unit>("/master/units", input);
  return data;
};

export const updateUnit = async (
  id: string,
  input: Partial<Omit<Unit, "id" | "createdAt">>
): Promise<Unit> => {
  const data = await api.put<Unit>(`/master/units/${id}`, input);
  return data;
};

export const deleteUnit = async (id: string): Promise<void> => {
  await api.delete(`/master/units/${id}`);
};