import type { ColorVariant } from "@/types/common.types";
import type { ProductSEO, TieredPrice, ProductShipping } from "@/types/product-schema.types";
import type { ProductStorefrontMeta } from "@/types/product-storefront-meta";

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  weightGrams: number;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stockQty: number;
  isActive: boolean;
}

export type ProductAttributeValue = {
  attributeId: string;
  value: string | string[] | number | boolean | Date | null;
};

export type ProductStatus = "active" | "draft" | "archived";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brandId: string | null;
  brand: { id: string; name: string; logoUrl: string } | null;
  categoryId: string;
  tags: string;
  storefrontMeta: ProductStorefrontMeta;
  sku: string;
  taxClassId: string | null;
  taxClass: { id: string; name: string } | null;
  price: number;
  status: ProductStatus;
  sortOrder: number;
  category?: { id: string; name: string; slug: string } | null;
  images: ProductImage[];
  variants: ProductVariant[];
  hasVariants: boolean;
  stock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryRecord {
  /** Row id — same as `variantId` (one row per `ProductVariant`). */
  id: string;
  productId: string;
  variantId: string | null;
  /** Mirrors `ProductVariant.stockQty`. */
  quantity: number;
  /** Not stored in DB; kept for UI compatibility (always 0). */
  reservedQuantity: number;
  /** Alert threshold; persisted client-side only (no Prisma field). */
  threshold: number;
  /** Not in schema; unused, kept for compatibility. */
  warehouseLocation: string;
  lastUpdatedAt: string;
  /** Denormalized for list views (from product API). */
  productName?: string;
  variantLabel?: string;
  productSku?: string;
}

export interface InventoryAdjustment {
  id: string;
  inventoryId: string;
  /** Denormalized when the adjustment is recorded (helps history after renames). */
  productId?: string;
  productName?: string;
  variantLabel?: string;
  type: "add" | "remove" | "set";
  quantity: number;
  reason: string;
  previousQuantity: number;
  newQuantity: number;
  createdAt: string;
  createdBy: string;
}

export interface Address {
  id: string;
  customerId: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type CustomerType = "walkin" | "online";
export type CustomerGroup = "retail" | "wholesale" | "vip";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  type: CustomerType;
  group: CustomerGroup;
  gstNumber: string | null;
  gstBusinessName: string | null;
  addresses: Address[];
  ledgerBalance: number;
  totalOrders: number;
  totalSpent: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  categorySlug?: string | null;
  lineLabel?: string;
  variantName: string | null;
  sku: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface ShipmentTracking {
  id: string;
  orderId: string;
  shiprocketOrderId: string | null;
  shipmentId: string | null;
  awbCode: string | null;
  courierName: string | null;
  trackingUrl: string | null;
  currentStatus: string | null;
  lastUpdated: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  note: string;
  createdAt: string;
  createdBy: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  items: OrderItem[];
  status: string;
  statusHistory: OrderStatusHistory[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  couponCode: string | null;
  notes: string;
  paymentMethod: string;
  paymentMethodCode: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  shipment: ShipmentTracking | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMode {
  id: string;
  label: string;
  code: string;
  isOnline: boolean;
  sortOrder: number;
  isActive: boolean;
}

export type LedgerEntryType = "sale" | "payment" | "refund" | "adjustment";

export interface LedgerEntry {
  id: string;
  customerId: string;
  transactionId: string | null;
  type: LedgerEntryType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  note: string;
  createdAt: string;
}
