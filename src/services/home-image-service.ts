import type { HomeImage, HomeImageApiRow, HomeImagesListApiData } from "@/types/cms.types";
import { parseHomeImageRow, toHomeImageMap } from "@/lib/home-image-utils";
import { api } from "@/services/api";

export const fetchHomeImages = async (): Promise<HomeImage[]> => {
  const data = await api.get<HomeImagesListApiData>("/cms/home-images");
  return (data.homeImages ?? []).map(parseHomeImageRow);
};

export const fetchStorefrontHomeImages = async () => {
  const data = await api.get<HomeImagesListApiData>("/storefront/home-images");
  return toHomeImageMap((data.homeImages ?? []).map(parseHomeImageRow));
};

export const updateHomeImage = async (
  id: string,
  input: Partial<Omit<HomeImage, "id" | "slotKey" | "section">>,
): Promise<HomeImage> => {
  const row = await api.put<HomeImageApiRow>(`/cms/home-images/${id}`, input);
  return parseHomeImageRow(row);
};

export const createHomeImage = async (
  input: Pick<HomeImage, "section" | "title"> &
    Partial<Omit<HomeImage, "id" | "slotKey" | "section" | "title" | "sortOrder">>,
): Promise<HomeImage> => {
  const row = await api.post<HomeImageApiRow>("/cms/home-images", input);
  return parseHomeImageRow(row);
};

export const deleteHomeImage = async (id: string): Promise<void> => {
  await api.delete(`/cms/home-images/${id}`);
};
