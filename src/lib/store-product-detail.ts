import { getDiscountPercent } from "@/constants/product-detail.constants";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/constants/product-image.constants";
import { parseProductTags } from "@/lib/product-api";
import { parseStorefrontMeta } from "@/lib/product-storefront-meta";
import type { StorefrontProductApi } from "@/types/product.types";

export type ProductDetailVariant = {
  id: string;
  label: string;
  weightGrams: number;
  price: number;
  compareAtPrice: number;
  stockQty: number;
  sku: string;
  isAvailable: boolean;
};

export type StoreProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  cutType: string;
  badge?: string;
  categorySlug?: string;
  categoryLabel: string;
  extraTags: string[];
  price: number;
  compareAtPrice: number;
  discountPercent: number;
  variants: ProductDetailVariant[];
  origin: string;
  cutInfo: string;
  storageInstructions: string;
  cookingTips: string;
  freshnessTags: string[];
  rating: number;
  reviewCount: number;
  savingsAmount: number;
};

const toNumber = (value: unknown): number => {
  const n = typeof value === "string" ? Number(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const stripHtml = (html: string): string =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const resolveCompareAtPrice = (price: number, compareRaw: unknown): number => {
  if (compareRaw == null || compareRaw === "") return price;
  const parsed = toNumber(compareRaw);
  return parsed > price ? parsed : price;
};

/** Formats a variant weight (grams) as e.g. "250g" / "1kg" / "1.5kg". */
export const formatWeightLabel = (weightGrams: number): string => {
  const g = Math.round(weightGrams);
  if (g >= 1000 && g % 1000 === 0) return `${g / 1000}kg`;
  if (g >= 1000) return `${(g / 1000).toFixed(1)}kg`;
  return `${g}g`;
};

const titleizeSlug = (slug: string): string =>
  slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const mapApiToStoreProductDetail = (
  raw: StorefrontProductApi,
): StoreProductDetail => {
  const parsedTags = parseProductTags(raw.tags);
  const meta = parseStorefrontMeta(raw.storefrontMeta);
  const cutType = parsedTags.cutType;
  const categorySlug = raw.category?.slug?.toLowerCase();
  const categoryLabel = raw.category?.name || (categorySlug ? titleizeSlug(categorySlug) : "");

  const imageUrls = (raw.images ?? [])
    .map((img) => img.url)
    .filter(Boolean);
  const primaryImage = imageUrls[0] ?? PRODUCT_PLACEHOLDER_IMAGE;
  const gallery = imageUrls.length ? imageUrls : [PRODUCT_PLACEHOLDER_IMAGE];

  const variants: ProductDetailVariant[] = (raw.variants ?? [])
    .filter((v) => v.isActive)
    .sort((a, b) => a.weightGrams - b.weightGrams)
    .map((v) => {
      const price = toNumber(v.price);
      const compareAtPrice = resolveCompareAtPrice(price, v.compareAtPrice);

      return {
        id: v.id,
        label: formatWeightLabel(v.weightGrams),
        weightGrams: v.weightGrams,
        price,
        compareAtPrice,
        stockQty: v.stockQty,
        sku: v.sku,
        isAvailable: v.stockQty > 0,
      };
    });

  const defaultVariant = variants.find((v) => v.isAvailable) ?? variants[0];
  const price = defaultVariant?.price ?? 0;
  const compareAtPrice = defaultVariant?.compareAtPrice ?? price;

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    description: stripHtml(raw.description ?? ""),
    image: primaryImage,
    gallery,
    cutType,
    badge: parsedTags.badge ?? undefined,
    categorySlug,
    categoryLabel,
    extraTags: parsedTags.userTags,
    price,
    compareAtPrice,
    discountPercent: getDiscountPercent(price, compareAtPrice),
    variants,
    origin: meta.origin ?? "",
    cutInfo: meta.cutInfo ?? "",
    storageInstructions: meta.storageInstructions ?? "",
    cookingTips: meta.cookingTips ?? "",
    freshnessTags: meta.freshnessTags ?? [],
    rating: raw.avgRating && raw.avgRating > 0 ? raw.avgRating : 0,
    reviewCount: raw.reviewCount ?? 0,
    savingsAmount: Math.max(0, compareAtPrice - price),
  };
};

export function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatInrSpaced(n: number): string {
  return `₹ ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export const formatPrice = formatInr;
