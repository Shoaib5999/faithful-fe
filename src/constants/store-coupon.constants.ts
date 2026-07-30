export const STORE_PENDING_COUPON_KEY = "faithfulmeat_pending_coupon";

export const getPendingCouponCode = (): string | null => {
  if (typeof window === "undefined") return null;
  const code = sessionStorage.getItem(STORE_PENDING_COUPON_KEY);
  return code?.trim() ? code.trim().toUpperCase() : null;
};

export const setPendingCouponCode = (code: string | null): void => {
  if (typeof window === "undefined") return;
  const trimmed = code?.trim();
  if (!trimmed) {
    sessionStorage.removeItem(STORE_PENDING_COUPON_KEY);
    return;
  }
  sessionStorage.setItem(STORE_PENDING_COUPON_KEY, trimmed.toUpperCase());
};
