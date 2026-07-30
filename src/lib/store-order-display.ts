import { format } from "date-fns";
import { resolveProductImage } from "@/constants/product-image.constants";
import { COD_PAYMENT_CODE } from "@/constants/payment.constants";
import { getCategoryDisplayLabel } from "@/constants/storefront.constants";
import { formatWeightLabel } from "@/lib/store-product-detail";
import type {
  StoreOrderApi,
  StoreOrderItemView,
  StoreOrderStatusView,
  StoreOrderView,
} from "@/types/store-order.types";

const toAmount = (value: string | number | undefined): number => {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

export const formatStoreOrderNumber = (orderId: string): string =>
  orderId.replace(/-/g, "").slice(0, 8).toUpperCase();

export const formatStoreOrderAmount = (amount: number): string =>
  `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const formatStoreOrderPlacedDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "d MMMM yyyy");
};

export const formatStoreOrderPlacedTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "h:mm a");
};

const buildStatusView = (order: StoreOrderApi): StoreOrderStatusView => {
  const paymentStatus = order.paymentStatus ?? "PENDING";
  const orderStatusCode = (order.status?.code ?? "PENDING").toUpperCase();
  const orderStatusLabel = order.status?.label ?? orderStatusCode;
  const paymentMethodCode = (order.paymentMode?.code ?? "").toUpperCase();
  const isCod = paymentMethodCode === COD_PAYMENT_CODE;

  const base = {
    progressMax: 3,
    showDeliveryProgress: true,
    isCancelled: false,
  } as const;

  if (orderStatusCode === "CANCELLED") {
    return {
      ...base,
      code: "cancelled",
      label: "Cancelled",
      headline: "",
      tone: "danger",
      progressStep: 0,
      showDeliveryProgress: false,
    };
  }

  if (paymentStatus === "REFUNDED") {
    return {
      ...base,
      code: "refunded",
      label: "Refunded",
      headline: "",
      tone: "success",
      progressStep: 0,
      showDeliveryProgress: false,
    };
  }

  switch (orderStatusCode) {
    case "DELIVERED":
    case "COMPLETED":
      return {
        ...base,
        code: "delivered",
        label: "Delivered",
        headline: "",
        tone: "success",
        progressStep: 3,
      };
    case "SHIPPED":
      return {
        ...base,
        code: "shipped",
        label: "Shipped",
        headline: "",
        tone: "info",
        progressStep: 2,
      };
    case "PROCESSING":
      return {
        ...base,
        code: "processing",
        label: "Processing",
        headline: "",
        tone: "info",
        progressStep: 1,
      };
    case "CONFIRMED":
      return {
        ...base,
        code: "confirmed",
        label: "Confirmed",
        headline: "",
        tone: "info",
        progressStep: 1,
      };
    case "RETURNED":
      return {
        ...base,
        code: "returned",
        label: "Returned",
        headline: "",
        tone: "neutral",
        progressStep: 0,
        showDeliveryProgress: false,
      };
    default:
      return {
        ...base,
        code: isCod ? "cod_placed" : "placed",
        label: isCod ? "Confirmed" : orderStatusLabel,
        headline: "",
        tone: "info",
        progressStep: isCod || paymentStatus === "PAID" ? 1 : 0,
      };
  }
};

const mapOrderItems = (order: StoreOrderApi): StoreOrderItemView[] =>
  (order.items ?? []).map((item) => {
    const unitPrice = toAmount(item.priceAtPurchase);
    const qty = item.quantity;
    const lineTotal = unitPrice * qty;
    const productName = item.variant?.product?.name?.trim() || "Product";
    const productSlug = item.variant?.product?.slug?.trim() ?? "";
    const weightGrams = item.variant?.weightGrams;
    const imageUrl = resolveProductImage(
      item.variant?.product?.images?.find((image) => image?.url)?.url,
    );
    const categorySlug = item.variant?.product?.category?.slug ?? null;

    return {
      id: item.id,
      name: productName,
      productSlug,
      variantLabel: weightGrams ? formatWeightLabel(weightGrams) : (item.variant?.sku ?? undefined),
      qty,
      unitPrice,
      lineTotal,
      lineTotalLabel: formatStoreOrderAmount(lineTotal),
      imageUrl,
      categorySlug,
      lineLabel: getCategoryDisplayLabel(categorySlug ?? ""),
    };
  });

export const mapStoreOrders = (rows: StoreOrderApi[]): StoreOrderView[] =>
  rows.map((order) => {
    const subtotal = toAmount(order.subtotal);
    const discount = toAmount(order.discount);
    const shippingCharge = toAmount(order.shippingCharge);
    const total = toAmount(order.total);
    const items = mapOrderItems(order);
    const status = buildStatusView(order);

    return {
      id: order.id,
      orderNumber: formatStoreOrderNumber(order.id),
      placedDateLabel: formatStoreOrderPlacedDate(order.createdAt),
      placedTimeLabel: formatStoreOrderPlacedTime(order.createdAt),
      placedAtIso: order.createdAt,
      updatedAtIso: order.updatedAt,
      total,
      totalLabel: formatStoreOrderAmount(total),
      subtotal,
      subtotalLabel: formatStoreOrderAmount(subtotal),
      shippingCharge,
      shippingLabel: formatStoreOrderAmount(shippingCharge),
      discount,
      discountLabel: formatStoreOrderAmount(discount),
      paymentMethod: order.paymentMode?.label ?? order.paymentMode?.code ?? "—",
      paymentMethodCode: order.paymentMode?.code ?? "",
      paymentStatus: order.paymentStatus ?? "PENDING",
      orderStatusCode: order.status?.code ?? "PENDING",
      orderStatusLabel: order.status?.label ?? "Pending",
      status,
      items,
      itemCount: items.reduce((sum, item) => sum + item.qty, 0),
    };
  });

export const STATUS_TONE_CLASS: Record<
  StoreOrderStatusView["tone"],
  { badge: string; text: string; bar: string }
> = {
  success: {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    text: "text-emerald-800",
    bar: "bg-emerald-600",
  },
  warning: {
    badge: "bg-amber-50 text-amber-900 border-amber-200",
    text: "text-amber-900",
    bar: "bg-amber-500",
  },
  danger: {
    badge: "bg-red-50 text-red-800 border-red-200",
    text: "text-red-800",
    bar: "bg-red-600",
  },
  neutral: {
    badge: "bg-neutral-100 text-neutral-700 border-neutral-200",
    text: "text-neutral-700",
    bar: "bg-neutral-500",
  },
  info: {
    badge: "bg-sky-50 text-sky-900 border-sky-200",
    text: "text-sky-900",
    bar: "bg-sky-600",
  },
};
