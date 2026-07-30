import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

type StorefrontFilterOptions = {
  priceRange: { min: number; max: number };
};

export const STOREFRONT_FILTER_OPTIONS_QUERY_KEY = ["storefront", "filter-options"] as const;

const fetchStorefrontFilterOptions = async (): Promise<StorefrontFilterOptions> => {
  const data = await api.get<StorefrontFilterOptions>("/search/filters");
  return {
    priceRange: {
      min: Number(data.priceRange?.min ?? 0),
      max: Number(data.priceRange?.max ?? 0),
    },
  };
};

export function useStorefrontFilterOptions() {
  return useQuery({
    queryKey: STOREFRONT_FILTER_OPTIONS_QUERY_KEY,
    queryFn: fetchStorefrontFilterOptions,
    staleTime: 5 * 60_000,
  });
}
