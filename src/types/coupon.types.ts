export type CouponType = "flat" | "percent";
export type CouponStatus = "active" | "expired" | "exhausted";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

/** Row returned by GET/POST/PUT `/coupons` */
export interface CouponApiRow {
  id: string;
  code: string;
  type: string;
  value: string | number;
  minOrder?: string | number | null;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface CouponsListApiData {
  coupons: CouponApiRow[];
  total: number;
  page: number;
  totalPages: number;
}

/** `data` from POST `/coupons/validate` */
export interface CouponValidateApiData {
  valid: boolean;
  message?: string;
  coupon?: { id: string; code: string; type: string; value: string | number };
  discount?: string;
}
