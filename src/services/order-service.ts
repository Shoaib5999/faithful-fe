import type { Address, Customer, Order, OrderItem, ShipmentTracking } from "@/types/commerce.types";
import { getCategoryDisplayLabel } from "@/constants/storefront.constants";
import { formatWeightLabel } from "@/lib/store-product-detail";
import { api } from "@/services/api";

export const ORDERS_QK = ["orders"] as const;

/** Stable array ref for seed-service; contents replaced by `fetchOrders`. */
const ordersCache: Order[] = [];

type ApiUser = { id: string; name: string; email: string | null };
type ApiAddress = {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  latitude?: number | null;
  longitude?: number | null;
};
type ApiPaymentMode = { id: string; label: string; code: string; isOnline: boolean };
type ApiOrderStatus = { id: string; code: string };
type ApiProductImage = { url: string };
type ApiVariant = {
  id: string;
  productId: string;
  sku: string;
  weightGrams: number;
  product: {
    id: string;
    name: string;
    sku: string;
    images?: ApiProductImage[];
    category?: { slug: string; name: string } | null;
  };
};
type ApiOrderItem = {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  priceAtPurchase: string | number;
  variant?: ApiVariant | null;
};
type ApiShipmentTracking = {
  id: string;
  orderId: string;
  shiprocketOrderId?: string | null;
  shipmentId?: string | null;
  awbCode?: string | null;
  courierName?: string | null;
  trackingUrl?: string | null;
  currentStatus?: string | null;
  lastUpdated?: string;
};
type ApiOrder = {
  id: string;
  userId: string;
  user: ApiUser;
  address: ApiAddress;
  status: ApiOrderStatus;
  paymentMode: ApiPaymentMode;
  subtotal: string | number;
  discount: string | number;
  shippingCharge: string | number;
  total: string | number;
  notes: string | null;
  coupon?: { code: string } | null;
  tracking?: ApiShipmentTracking | null;
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
  items: ApiOrderItem[];
};

type OrderListResponse = {
  orders: ApiOrder[];
  total: number;
  page: number;
  totalPages: number;
};

const num = (v: string | number | undefined | null): number => {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const splitName = (name: string): { firstName: string; lastName: string } => {
  const t = name.trim();
  const i = t.indexOf(" ");
  if (i === -1) return { firstName: t || "Customer", lastName: "" };
  return { firstName: t.slice(0, i), lastName: t.slice(i + 1).trim() };
};

const mapAddress = (row: ApiAddress | null | undefined, customerId: string): Address | null => {
  if (!row) return null;
  return {
    id: row.id,
    customerId,
    label: row.label,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    postalCode: row.pincode,
    country: "",
    isDefault: row.isDefault,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
  };
};

const mapCustomer = (user: ApiUser): Customer => {
  const { firstName, lastName } = splitName(user.name || "");
  return {
    id: user.id,
    firstName,
    lastName,
    email: user.email,
    phone: null,
    type: "online",
    group: "retail",
    gstNumber: null,
    gstBusinessName: null,
    addresses: [],
    ledgerBalance: 0,
    totalOrders: 0,
    totalSpent: 0,
    notes: null,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
};

const mapItem = (row: ApiOrderItem): OrderItem => {
  const v = row.variant;
  const p = v?.product;
  const unitPrice = num(row.priceAtPurchase);
  const qty = row.quantity;
  const productId = p?.id ?? v?.productId ?? "";
  const imageUrl = p?.images?.[0]?.url ?? null;
  const categorySlug = p?.category?.slug ?? null;
  return {
    id: row.id,
    orderId: row.orderId,
    productId,
    variantId: row.variantId,
    productName: p?.name ?? "Unknown product",
    categorySlug,
    lineLabel: getCategoryDisplayLabel(categorySlug ?? ""),
    variantName: v ? formatWeightLabel(v.weightGrams) : null,
    sku: v?.sku ?? p?.sku ?? "",
    imageUrl,
    quantity: qty,
    unitPrice,
    discount: 0,
    totalPrice: unitPrice * qty,
  };
};

const mapShipment = (row: ApiShipmentTracking | null | undefined): ShipmentTracking | null => {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.orderId,
    shiprocketOrderId: row.shiprocketOrderId ?? null,
    shipmentId: row.shipmentId ?? null,
    awbCode: row.awbCode ?? null,
    courierName: row.courierName ?? null,
    trackingUrl: row.trackingUrl ?? null,
    currentStatus: row.currentStatus ?? null,
    lastUpdated: row.lastUpdated ?? new Date().toISOString(),
  };
};

const mapApiOrder = (row: ApiOrder): Order => {
  const subtotal = num(row.subtotal);
  const discountAmount = num(row.discount);
  const shippingAmount = num(row.shippingCharge);
  const total = num(row.total);
  return {
    id: row.id,
    orderNumber: row.id.slice(0, 8).toUpperCase(),
    customerId: row.userId,
    customer: mapCustomer(row.user),
    items: (row.items ?? []).map(mapItem),
    status: row.status?.code ?? "PENDING",
    statusHistory: [],
    shippingAddress: mapAddress(row.address, row.userId),
    billingAddress: null,
    subtotal,
    taxAmount: 0,
    discountAmount,
    shippingAmount,
    total,
    couponCode: row.coupon?.code ?? null,
    notes: row.notes ?? "",
    paymentMethod: row.paymentMode?.label ?? row.paymentMode?.code ?? "—",
    paymentMethodCode: row.paymentMode?.code ?? "",
    paymentStatus: row.paymentStatus ?? "PENDING",
    shipment: mapShipment(row.tracking),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const fetchAllOrderPages = async (): Promise<Order[]> => {
  const merged: Order[] = [];
  let page = 1;
  const limit = 100;
  const maxPages = 500;

  for (; page <= maxPages; page += 1) {
    const data = await api.get<OrderListResponse>("/orders", { page, limit });
    const rows = Array.isArray(data.orders) ? data.orders : [];
    if (rows.length === 0) break;

    merged.push(...rows.map(mapApiOrder));

    const total = Number(data.total);
    const rawTp = Number(data.totalPages);
    const totalPages =
      Number.isFinite(rawTp) && rawTp > 0
        ? rawTp
        : Number.isFinite(total) && total > 0
          ? Math.ceil(total / limit)
          : page;

    if (page >= totalPages || rows.length < limit) break;
  }

  ordersCache.splice(0, ordersCache.length, ...merged);
  return [...ordersCache];
};

export const fetchOrders = (): Promise<Order[]> => fetchAllOrderPages();

export const fetchOrderById = async (orderId: string): Promise<Order> => {
  const raw = await api.get<ApiOrder>(`/orders/${orderId}`);
  return mapApiOrder(raw);
};

export const updateOrderStatus = async (
  orderId: string,
  input: { toStatus: string; note: string; createdBy: string },
): Promise<void> => {
  await api.patch(`/orders/${orderId}/status`, { status: input.toStatus });
};

/** No admin endpoint for notes; UI may still call this — fails clearly. */
export const addOrderNote = async (_orderId: string, _note: string): Promise<void> => {
  throw new Error("Order notes cannot be updated from admin (API does not support it).");
};

export const getOrdersByCustomerId = (customerId: string): Order[] =>
  ordersCache.filter((o) => o.customerId === customerId);

export const getAllOrders = (): Order[] => [...ordersCache];

export const getOrderArray = (): Order[] => ordersCache;
