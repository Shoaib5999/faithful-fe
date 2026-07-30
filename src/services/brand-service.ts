import type { Brand } from "@/types/master.types";
import { api } from "@/services/api";

export const fetchBrands = async (): Promise<Brand[]> => {
  const data = await api.get<Brand[]>("/master/brands");
  return data;
};

export const createBrand = async (
  input: Omit<Brand, "id" | "createdAt">
): Promise<Brand> => {
  const data = await api.post<Brand>(
    "/master/brands",
    input
  );

  return data;
};

export const updateBrand = async (
  id: string,
  input: Partial<Omit<Brand, "id" | "createdAt">>
): Promise<Brand> => {
  const data = await api.put<Brand>(
    `/master/brands/${id}`,
    input
  );

  return data;
};

export const deleteBrand = async (
  id: string
): Promise<void> => {
  await api.delete(`/master/brands/${id}`);
};