import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/services/category-service";

export const STOREFRONT_CATEGORIES_QUERY_KEY = ["storefront", "categories"] as const;

export function useStorefrontCategories() {
  return useQuery({
    queryKey: STOREFRONT_CATEGORIES_QUERY_KEY,
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });
}
