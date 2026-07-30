import { api } from "@/services/api";
import { resolveProductImage } from "@/constants/product-image.constants";
import { formatWeightLabel } from "@/lib/store-product-detail";

export type ApiCartVariantProductImage = { url?: string | null; isPrimary?: boolean };
export type ApiCartVariantProduct = {
  id: string;
  name: string;
  sku?: string | null;
  images?: ApiCartVariantProductImage[];
  category?: { slug?: string | null } | null;
};
export type ApiCartVariant = {
  id: string;
  price: string | number;
  stockQty: number;
  weightGrams: number;
  product: ApiCartVariantProduct;
};
export type ApiCartItem = {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: ApiCartVariant;
};
export type ApiCart = {
  id: string;
  userId: string;
  items: ApiCartItem[];
};

export type StoreShippingMethod = {
  id: string;
  name: string;
  code: string;
  fee: number;
  deliveryLabel: string;
  isDefault: boolean;
};

export type StoreCartSummary = {
  cart: ApiCart;
  subtotal: string;
  discount: string;
  shippingCharge: string;
  total: string;
  coupon: { code: string; type: string; value: string | number } | null;
  shippingMethod?: StoreShippingMethod | null;
  isFreeShippingApplied?: boolean;
  shippingMethods?: StoreShippingMethod[];
  shippingSettings?: {
    defaultShippingFee: number;
    freeShippingThreshold: number;
    isFreeShippingEnabled: boolean;
  };
};

const formatInr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const toNum = (v: string | number): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function mapApiCartItemsToLines(items: ApiCartItem[]) {
  return items.map((item) => {
    const v = item.variant;
    const img = resolveProductImage(v.product.images?.find((i) => i?.url)?.url);
    const price = toNum(v.price);
    return {
      id: item.id,
      serverLineId: item.id,
      variantId: item.variantId,
      name: v.product.name,
      image: img,
      price: formatInr(price),
      priceNumber: price,
      notes: formatWeightLabel(v.weightGrams),
      categorySlug: v.product.category?.slug ?? undefined,
      stockQty: v.stockQty,
      qty: item.quantity,
    };
  });
}

export type StoreCartQuery = {
  coupon?: string;
  shippingMethod?: string;
};

export async function fetchStoreCartSummary(query?: StoreCartQuery): Promise<StoreCartSummary> {
  const params: Record<string, string> = {};
  if (query?.coupon) params.coupon = query.coupon;
  if (query?.shippingMethod) params.shippingMethod = query.shippingMethod;
  return api.get<StoreCartSummary>("/cart", Object.keys(params).length ? params : undefined);
}

export async function addStoreCartItem(variantId: string, quantity: number): Promise<void> {
  await api.post<unknown>("/cart/items", { variantId, quantity });
}

export async function updateStoreCartItem(itemId: string, quantity: number): Promise<void> {
  await api.put<unknown>(`/cart/items/${itemId}`, { quantity });
}

export async function removeStoreCartItem(itemId: string): Promise<void> {
  await api.delete<unknown>(`/cart/items/${itemId}`);
}

export async function clearStoreCartApi(): Promise<void> {
  await api.delete<unknown>("/cart");
}

export type GuestCartEstimateInput = {
  items: Array<{ variantId: string; quantity: number }>;
  coupon?: string;
  shippingMethod?: string;
};

export async function estimateGuestCart(input: GuestCartEstimateInput): Promise<StoreCartSummary> {
  return api.post<StoreCartSummary>("/cart/estimate", {
    items: input.items,
    coupon: input.coupon,
    shippingMethod: input.shippingMethod,
  });
}
