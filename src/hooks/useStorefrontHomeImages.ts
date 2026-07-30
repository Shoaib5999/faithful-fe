import { useQuery } from "@tanstack/react-query";
import { fetchStorefrontHomeImages } from "@/services/home-image-service";

export const STOREFRONT_HOME_IMAGES_QUERY_KEY = ["storefront-home-images"] as const;

export function useStorefrontHomeImages() {
  return useQuery({
    queryKey: STOREFRONT_HOME_IMAGES_QUERY_KEY,
    queryFn: fetchStorefrontHomeImages,
    staleTime: 60_000,
  });
}
