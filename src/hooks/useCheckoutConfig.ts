import { useQuery } from "@tanstack/react-query";
import { fetchCheckoutConfig } from "@/services/payment-service";

export const CHECKOUT_CONFIG_QUERY_KEY = ["storefront", "checkout-config"] as const;

export function useCheckoutConfig() {
  return useQuery({
    queryKey: CHECKOUT_CONFIG_QUERY_KEY,
    queryFn: fetchCheckoutConfig,
    staleTime: 5 * 60_000,
  });
}
