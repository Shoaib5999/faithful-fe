import { useQuery } from "@tanstack/react-query";
import { fetchPaymentModes } from "@/services/payment-mode-service";

export const STOREFRONT_PAYMENT_MODES_QUERY_KEY = ["storefront", "payment-modes"] as const;

export function useStorefrontPaymentModes() {
  return useQuery({
    queryKey: STOREFRONT_PAYMENT_MODES_QUERY_KEY,
    queryFn: fetchPaymentModes,
    staleTime: 30_000,
  });
}
