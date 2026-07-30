import type {
  Coupon,
  CouponApiRow,
  CouponType,
  CouponsListApiData,
  CouponValidateApiData,
} from "@/types/coupon.types";
import { api } from "@/services/api";

let couponsCache: Coupon[] = [];

const toNum = (v: string | number | null | undefined): number => {
  if (v === null || v === undefined) return NaN;
  return typeof v === "number" ? v : parseFloat(v);
};

const mapType = (t: string): CouponType => (t === "percent" ? "percent" : "flat");

const parseCouponRow = (row: CouponApiRow): Coupon => {
  const minRaw = row.minOrder;
  const minParsed = minRaw === null || minRaw === undefined ? null : toNum(minRaw);
  return {
    id: row.id,
    code: row.code,
    type: mapType(row.type),
    value: toNum(row.value) || 0,
    minOrder: minParsed === null || Number.isNaN(minParsed) ? null : minParsed,
    maxUses: row.maxUses ?? null,
    usedCount: row.usedCount,
    isActive: row.isActive,
    expiresAt: row.expiresAt ?? null,
    createdAt:
      typeof row.createdAt === "string"
        ? row.createdAt
        : new Date(row.createdAt as unknown as Date).toISOString(),
  };
};

const refreshCache = (list: Coupon[]) => {
  couponsCache = list;
};

export const fetchCoupons = async (): Promise<Coupon[]> => {
  const merged: Coupon[] = [];
  let page = 1;
  const limit = 100;
  for (;;) {
    const data = await api.get<CouponsListApiData>("/coupons", { page, limit });
    merged.push(...data.coupons.map(parseCouponRow));
    if (page >= data.totalPages || data.coupons.length === 0) break;
    page += 1;
  }
  refreshCache(merged);
  return merged;
};

export const createCoupon = async (
  input: Omit<Coupon, "id" | "createdAt" | "usedCount">
): Promise<Coupon> => {
  const row = await api.post<CouponApiRow>("/coupons", {
    code: input.code,
    type: input.type,
    value: input.value,
    minOrder: input.minOrder ?? undefined,
    maxUses: input.maxUses ?? undefined,
    expiresAt: input.expiresAt ?? undefined,
  });
  return parseCouponRow(row);
};

export const updateCoupon = async (
  id: string,
  input: Partial<Omit<Coupon, "id" | "createdAt">>
): Promise<Coupon> => {
  const body: Record<string, unknown> = {};
  if (input.isActive !== undefined) body.isActive = input.isActive;
  if (input.maxUses !== undefined) body.maxUses = input.maxUses;
  if (input.expiresAt !== undefined && input.expiresAt !== null) body.expiresAt = input.expiresAt;
  if (input.minOrder !== undefined) body.minOrder = input.minOrder;
  const row = await api.put<CouponApiRow>(`/coupons/${id}`, body);
  return parseCouponRow(row);
};

export const deleteCoupon = async (id: string): Promise<void> => {
  await api.delete(`/coupons/${id}`);
};

export const validateCoupon = async (
  code: string,
  orderTotal: number,
  _customerId: string | null
): Promise<{ valid: boolean; coupon: Coupon | null; error: string | null }> => {
  const result = await api.post<CouponValidateApiData>("/coupons/validate", {
    code: code.toUpperCase(),
    orderTotal,
  });
  if (!result.valid) {
    return { valid: false, coupon: null, error: result.message ?? "Invalid coupon" };
  }
  const p = result.coupon;
  if (!p) return { valid: false, coupon: null, error: "Invalid coupon" };
  return {
    valid: true,
    coupon: {
      id: p.id,
      code: p.code,
      type: mapType(p.type),
      value: toNum(p.value) || 0,
      minOrder: null,
      maxUses: null,
      usedCount: 0,
      isActive: true,
      expiresAt: null,
      createdAt: "",
    },
    error: null,
  };
};

export const generateCouponCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const getAllCoupons = (): Coupon[] => [...couponsCache];
