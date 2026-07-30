import { ACTIVE_ORDER_STATUS_CODES } from "@/constants/order.constants";
import { COD_PAYMENT_CODE } from "@/constants/payment.constants";
import type { Order, OrderItem } from "@/types/commerce.types";
import type { OrderStatus } from "@/types/master.types";

/** Poll admin orders while Shiprocket shipments are in transit. */
export const ORDERS_SHIPROCKET_POLL_MS = 30_000;

export const getOrderStatusLabel = (
  code: string,
  orderStatuses: OrderStatus[],
): string => orderStatuses.find((s) => s.code === code)?.label ?? code;

export const filterActiveOrderStatuses = (orderStatuses: OrderStatus[]): OrderStatus[] =>
  orderStatuses.filter((s) =>
    (ACTIVE_ORDER_STATUS_CODES as readonly string[]).includes(s.code),
  );

export const isCodOrder = (order: Order): boolean =>
  order.paymentMethodCode.toUpperCase() === COD_PAYMENT_CODE;

export const canShipWithShiprocket = (order: Order): boolean =>
  order.status !== "PENDING" &&
  order.status !== "CANCELLED" &&
  order.status !== "DELIVERED" &&
  order.status !== "RETURNED";

export type OrderActionPhase =
  | "cod_confirm"
  | "waiting_payment"
  | "ready_to_ship"
  | "shipped"
  | "complete";

export const getOrderActionPhase = (order: Order, hasAwb: boolean): OrderActionPhase => {
  if (order.status === "DELIVERED" || order.status === "CANCELLED" || order.status === "RETURNED") {
    return "complete";
  }
  if (hasAwb) return "shipped";
  if (isCodOrder(order) && order.status === "PENDING") return "cod_confirm";
  if (!isCodOrder(order) && order.paymentStatus === "PENDING" && order.status === "PENDING") {
    return "waiting_payment";
  }
  if (canShipWithShiprocket(order)) return "ready_to_ship";
  return "complete";
};

export const getOrderActionMessage = (phase: OrderActionPhase, order: Order): string => {
  switch (phase) {
    case "cod_confirm":
      return "Step 1: Confirm this COD order";
    case "waiting_payment":
      return "Waiting for customer to pay online — you can ship after payment is received";
    case "ready_to_ship":
      return isCodOrder(order)
        ? "Step 2: Pack the order, then ship with Shiprocket"
        : "Payment received — pack the order, then ship with Shiprocket";
    case "shipped":
      return "Shipped — print label if needed, courier will pick up. Status updates automatically.";
    case "complete":
      if (order.status === "DELIVERED") return "Order delivered — all done";
      if (order.status === "CANCELLED") return "Order cancelled";
      if (order.status === "RETURNED") return "Order returned";
      return "No action needed";
  }
};

export const formatOrderProductsPreview = (items: OrderItem[]): string => {
  const names = items
    .map((i) => i.productName)
    .filter((name) => name && name !== "Unknown product");
  if (names.length === 0) {
    return items.length === 1 ? "1 item" : `${items.length} items`;
  }
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]}, ${names[1]}`;
  return `${names[0]}, ${names[1]} +${names.length - 2} more`;
};

export const getOrderDominantLineLabel = (order: Order): string | null => {
  const labels = order.items
    .map((item) => item.lineLabel)
    .filter((label): label is string => Boolean(label));
  return labels[0] ?? null;
};

/** "all" or a category slug (e.g. "chicken", "mutton"). */
export type ProductLineFilter = "all" | (string & {});

export const orderMatchesProductLine = (
  order: Order,
  filter: ProductLineFilter,
): boolean => {
  if (filter === "all") return true;
  return order.items.some((item) => item.categorySlug === filter);
};

export const orderMatchesProductSearch = (order: Order, query: string): boolean => {
  const q = query.toLowerCase();
  return order.items.some(
    (item) =>
      item.productName.toLowerCase().includes(q) ||
      (item.variantName?.toLowerCase().includes(q) ?? false) ||
      item.sku.toLowerCase().includes(q),
  );
};

export const orderMayReceiveShiprocketUpdates = (
  order: Order,
  orderStatuses: OrderStatus[],
): boolean => {
  const shipment = order.shipment;
  if (!shipment) return false;

  const hasShipment = Boolean(
    shipment.awbCode || shipment.shiprocketOrderId || shipment.shipmentId,
  );
  if (!hasShipment) return false;

  const statusObj = orderStatuses.find((s) => s.code === order.status);
  return !(statusObj?.isFinal ?? false);
};

export const ordersNeedShiprocketPolling = (
  orders: Order[],
  orderStatuses: OrderStatus[],
): boolean => orders.some((o) => orderMayReceiveShiprocketUpdates(o, orderStatuses));
