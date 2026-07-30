/** Order statuses used in the live checkout → Shiprocket flow. */
export const ACTIVE_ORDER_STATUS_CODES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

export type ActiveOrderStatusCode = (typeof ACTIVE_ORDER_STATUS_CODES)[number];

/** Statuses an admin can pick manually (Shiprocket handles ship/delivery/return). */
export const ADMIN_MANUAL_STATUS_CODES = [
  "CONFIRMED",
  "PROCESSING",
  "CANCELLED",
] as const;
