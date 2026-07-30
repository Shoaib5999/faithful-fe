import type { ModalKey } from "@/types/modal.types";
import type { Coupon } from "@/types/coupon.types";

export type GlobalSearchAction =
  | { type: "modal"; modalKey: ModalKey; payload: Record<string, unknown> }
  | { type: "navigate"; path: string; state?: GlobalSearchNavigateState };

export type GlobalSearchNavigateState = {
  couponSearch?: string;
  openCoupon?: Coupon;
};
