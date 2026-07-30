import { api } from "@/services/api";
import type { Attribute, AttributeOption } from "@/types/master.types";

export const fetchAttributes = async (): Promise<Attribute[]> => {
  const data = await api.get<Attribute[]>("/master/attributes");
  return data;
};

export const createAttribute = async (
  input: Omit<Attribute, "id" | "options">
): Promise<Attribute> => {
  const res = await api.post<{ data: Attribute }>("/master/attributes", input);
  return res.data;
};

export const updateAttribute = async (
  id: string,
  input: Partial<Omit<Attribute, "id" | "options">>
): Promise<Attribute> => {
  const res = await api.put<{ data: Attribute }>(
    `/master/attributes/${id}`,
    input
  );
  return res.data;
};

export const deleteAttribute = async (id: string): Promise<void> => {
  await api.delete(`/master/attributes/${id}`);
};


export const addAttributeOption = async (
  attributeId: string,
  input: Omit<AttributeOption, "id" | "attributeId">
): Promise<AttributeOption> => {
  const res = await api.post<{ data: AttributeOption }>(
    `/master/attributes/${attributeId}/values`,
    input
  );
  return res.data;
};

export const deleteAttributeOption = async (
  valueId: string
): Promise<void> => {
  await api.delete(`/master/attributes/values/${valueId}`);
};