import { api } from "@/services/api";
import type { StorefrontProductApi } from "@/types/product.types";

type WishlistToggleResponse = unknown;

const parseWishlisted = (data: WishlistToggleResponse): boolean => {
  if (typeof data === "boolean") return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (obj.action === "added") return true;
    if (obj.action === "removed") return false;
    const direct =
      (typeof obj.wishlisted === "boolean" && obj.wishlisted) ||
      (typeof obj.isWishlisted === "boolean" && obj.isWishlisted) ||
      (typeof obj.data === "boolean" && obj.data);
    if (typeof direct === "boolean") return direct;
  }
  return Boolean(data);
};

export const WISHLIST_IDS_QUERY_KEY = ["wishlist", "ids"] as const;
export const WISHLIST_PAGE_QUERY_KEY = ["wishlist", "page"] as const;

export async function fetchWishlistProductIds(): Promise<string[]> {
  const data = await api.get<{ productIds: string[] }>("/wishlist/ids");
  return data.productIds ?? [];
}

export async function checkWishlist(productId: string): Promise<boolean> {
  const data = await api.get<WishlistToggleResponse>(`/wishlist/check/${productId}`);
  return parseWishlisted(data);
}

export async function toggleWishlist(productId: string): Promise<{ wishlisted: boolean }> {
  const data = await api.post<WishlistToggleResponse>(`/wishlist/toggle`, {
    productId,
  });
  return { wishlisted: parseWishlisted(data) };
}

export type WishlistPageResponse = {
  items: { productId: string; product: StorefrontProductApi }[];
  total: number;
  page: number;
  totalPages: number;
};

export async function fetchWishlistProducts(params?: {
  page?: number;
  limit?: number;
}): Promise<WishlistPageResponse> {
  return api.get<WishlistPageResponse>("/wishlist", params);
}

export async function clearWishlistApi(): Promise<void> {
  await api.delete<unknown>("/wishlist");
}
