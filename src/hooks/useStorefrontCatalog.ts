import { useQuery } from "@tanstack/react-query";
import { fetchStorefrontCatalog } from "@/services/storefront-product-service";

export const STOREFRONT_CATALOG_QUERY_KEY = ["storefront-catalog"] as const;

export function useStorefrontCatalog() {
  return useQuery({
    queryKey: STOREFRONT_CATALOG_QUERY_KEY,
    queryFn: fetchStorefrontCatalog,
    staleTime: 60_000,
  });
}
