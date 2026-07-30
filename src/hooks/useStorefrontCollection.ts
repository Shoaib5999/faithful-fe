import { useInfiniteQuery } from "@tanstack/react-query";
import { COLLECTION_PAGE_SIZE } from "@/constants/collection.constants";
import {
  fetchStorefrontCollectionPage,
  type StorefrontCollectionParams,
} from "@/services/storefront-product-service";

export type StorefrontCollectionFilters = Omit<StorefrontCollectionParams, "page">;

export const storefrontCollectionQueryKey = (filters: StorefrontCollectionFilters) =>
  [
    "storefront-collection",
    "infinite",
    filters.query ?? "",
    filters.sort ?? "newest",
    filters.priceMin ?? null,
    filters.priceMax ?? null,
    filters.brandSlug ?? null,
    filters.categorySlug ?? null,
    filters.quickFilters?.slice().sort().join(",") ?? "",
    filters.cutTypeSlug ?? null,
  ] as const;

export function useStorefrontCollection(filters: StorefrontCollectionFilters) {
  const limit = filters.limit ?? COLLECTION_PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: storefrontCollectionQueryKey(filters),
    queryFn: ({ pageParam }) =>
      fetchStorefrontCollectionPage({
        ...filters,
        page: pageParam,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.totalPages === 0) return undefined;
      if (lastPage.page >= lastPage.totalPages) return undefined;
      if (lastPage.products.length === 0) return undefined;
      return lastPage.page + 1;
    },
    staleTime: 30_000,
  });
}
