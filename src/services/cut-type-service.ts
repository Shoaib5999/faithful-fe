import { api } from "@/services/api";
import type { CutType, CutTypeInput } from "@/types/cut-type.types";

export const CUT_TYPES_QK = ["cut-types"] as const;
export const PUBLIC_CUT_TYPES_QK = ["cut-types", "public"] as const;

export const fetchPublicCutTypes = async (): Promise<CutType[]> => {
  const data = await api.get<CutType[]>("/cut-types/public");
  return Array.isArray(data) ? data : [];
};

export const fetchCutTypes = async (): Promise<CutType[]> => {
  const data = await api.get<CutType[]>("/cut-types");
  return Array.isArray(data) ? data : [];
};

export const createCutType = (input: CutTypeInput) =>
  api.post<CutType>("/cut-types", input);

export const updateCutType = (id: string, input: Partial<CutTypeInput>) =>
  api.put<CutType>(`/cut-types/${id}`, input);

export const deleteCutType = (id: string) =>
  api.delete(`/cut-types/${id}`);

export const reorderCutTypes = (orderedIds: string[]) =>
  api.put<CutType[]>("/cut-types/reorder", { orderedIds });
