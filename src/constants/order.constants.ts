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

/**
 * Statuses an admin can pick manually. Delivery is within-city and manual (no Shiprocket),
 * so admins own the full lifecycle from confirmation through delivery.
 */
export const ADMIN_MANUAL_STATUS_CODES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

/** Flip to true to re-enable the Shiprocket ship/track/label flow in the admin order view. */
export const SHIPROCKET_ENABLED = false;
