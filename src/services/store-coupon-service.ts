import { getApiBaseUrl } from "@/config/api";
import { getStoreTokens } from "@/services/store-auth-service";
import { parseStoreApiMessage } from "@/services/store-api";

export type PublicCoupon = {
  id: string;
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrder: number | null;
  expiresAt: string | null;
  description: string;
};

export const fetchPublicActiveCoupons = async (): Promise<PublicCoupon[]> => {
  const response = await fetch(`${getApiBaseUrl()}/coupons/public/active`);
  if (!response.ok) {
    throw new Error(await parseStoreApiMessage(response));
  }
  const body = await response.json();
  const data = body.data as { coupons?: PublicCoupon[] };
  return data?.coupons ?? [];
};

export const validateStoreCoupon = async (
  code: string,
  orderTotal: number,
): Promise<{ valid: boolean; message?: string; discount?: string }> => {
  const tokens = getStoreTokens();
  if (!tokens?.accessToken) {
    return { valid: false, message: "Please sign in to apply a coupon." };
  }

  const response = await fetch(`${getApiBaseUrl()}/coupons/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify({ code: code.toUpperCase(), orderTotal }),
  });

  const body = await response.json().catch(() => ({}));
  const data = body.data as {
    valid?: boolean;
    message?: string;
    discount?: string;
  };

  if (!response.ok) {
    return { valid: false, message: body.message ?? "Could not validate coupon" };
  }

  return {
    valid: Boolean(data?.valid),
    message: data?.message,
    discount: data?.discount,
  };
};
