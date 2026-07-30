export type StoreOrderPaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type StoreOrderApiItem = {
  id: string;
  quantity: number;
  priceAtPurchase: string | number;
  variant?: {
    weightGrams?: number | null;
    sku?: string | null;
    product?: {
      name?: string;
      slug?: string;
      images?: Array<{ url?: string | null; isPrimary?: boolean }>;
      category?: { slug?: string | null; name?: string | null } | null;
    } | null;
  } | null;
};

export type StoreOrderApi = {
  id: string;
  createdAt: string;
  updatedAt: string;
  subtotal: string | number;
  discount: string | number;
  shippingCharge: string | number;
  total: string | number;
  paymentStatus: StoreOrderPaymentStatus;
  status?: { code?: string; label?: string } | null;
  paymentMode?: { code?: string; label?: string; isOnline?: boolean } | null;
  payment?: {
    status?: StoreOrderPaymentStatus;
    razorpayRefundId?: string | null;
    refundAmount?: string | number | null;
    refundReason?: string | null;
    refundedAt?: string | null;
    updatedAt?: string;
  } | null;
  items?: StoreOrderApiItem[];
};

export type StoreOrderItemView = {
  id: string;
  name: string;
  productSlug: string;
  variantLabel?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  lineTotalLabel: string;
  imageUrl: string;
  categorySlug?: string | null;
  lineLabel?: string;
};

export type StoreOrderStatusTone = "success" | "warning" | "danger" | "neutral" | "info";

export type StoreOrderStatusView = {
  code: string;
  label: string;
  headline: string;
  tone: StoreOrderStatusTone;
  progressStep: number;
  progressMax: number;
  showDeliveryProgress: boolean;
  isCancelled: boolean;
};

export type StoreOrderView = {
  id: string;
  orderNumber: string;
  placedDateLabel: string;
  placedTimeLabel: string;
  placedAtIso: string;
  updatedAtIso: string;
  total: number;
  totalLabel: string;
  subtotal: number;
  subtotalLabel: string;
  shippingCharge: number;
  shippingLabel: string;
  discount: number;
  discountLabel: string;
  paymentMethod: string;
  paymentMethodCode: string;
  paymentStatus: StoreOrderPaymentStatus;
  orderStatusCode: string;
  orderStatusLabel: string;
  status: StoreOrderStatusView;
  items: StoreOrderItemView[];
  itemCount: number;
};
