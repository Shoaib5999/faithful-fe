import { useQuery } from "@tanstack/react-query";
import { fetchBrands } from "@/services/brand-service";

export const STOREFRONT_BRANDS_QUERY_KEY = ["storefront", "brands"] as const;

export function useStorefrontBrands() {
  return useQuery({
    queryKey: STOREFRONT_BRANDS_QUERY_KEY,
    queryFn: fetchBrands,
    staleTime: 5 * 60_000,
  });
}
