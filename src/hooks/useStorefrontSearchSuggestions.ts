import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchStorefrontCollectionPage } from "@/services/storefront-product-service";
import { APP_CONFIG } from "@/constants/app.constants";

export const STOREFRONT_SEARCH_SUGGESTIONS_KEY = "storefront-search-suggestions";

export function useStorefrontSearchSuggestions(query: string, enabled: boolean) {
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, APP_CONFIG.searchDebounceMs);

  return useQuery({
    queryKey: [STOREFRONT_SEARCH_SUGGESTIONS_KEY, debounced],
    queryFn: () =>
      fetchStorefrontCollectionPage({
        query: debounced,
        page: 1,
        limit: 6,
      }),
    enabled: enabled && debounced.length >= 2,
    staleTime: 30_000,
  });
}
