import type {
  Product,
  ProductImage,
  ProductStatus,
  ProductVariant,
} from "@/types/commerce.types";
import type { ApiProduct } from "@/types/product.types";
import {
  buildStorefrontMeta,
  parseStorefrontMeta,
} from "@/lib/product-storefront-meta";
import type { ProductStorefrontMeta } from "@/types/product-storefront-meta";

import { STOREFRONT_COLLECTION_SLUGS } from "@/types/product-schema.types";

/** Fallback cut-type options used when no CutType records exist yet. */
export const CUT_TYPES = [
  "Curry Cut",
  "Boneless",
  "Whole",
  "Fillet",
  "Steaks",
  "Mince",
  "Drumstick",
  "Breast",
] as const;

const CUT_TYPE_TAG_PREFIX = "cut:";

export const parseCutTypes = (tagValue: string): string[] =>
  tagValue
    .split("+")
    .map((type) => type.trim())
    .filter(Boolean);

/** One `cut:` tag per type so collection filters match any selected type. */
export const buildCutTypeTags = (types: string[]): string[] => {
  const unique = [...new Set(types.map((type) => type.trim()).filter(Boolean))];
  return unique.map((type) => `${CUT_TYPE_TAG_PREFIX}${type}`);
};

/** Display label for one or more cut types on storefront / admin. */
export const formatCutTypes = (types: string[]): string =>
  types.map((type) => type.trim()).filter(Boolean).join(" · ");

/** Stored in product tags as `badge:<slug>`. */
export type ProductBadge = string;

export type ProductBadgeOption = {
  slug: string;
  name: string;
};

/** Product badge options — align with storefront home sections. */
export const PRODUCT_BADGE_OPTIONS: ProductBadgeOption[] = [
  { slug: STOREFRONT_COLLECTION_SLUGS.BEST_SELLERS, name: "Best sellers" },
  { slug: STOREFRONT_COLLECTION_SLUGS.NEW_ARRIVALS, name: "New Arrivals" },
];

const PRODUCT_BADGE_LABELS = new Map(
  PRODUCT_BADGE_OPTIONS.map((o) => [o.slug, o.name]),
);

/** Display label for a collection slug stored in product tags. */
export const formatProductBadgeLabel = (slug: string): string =>
  PRODUCT_BADGE_LABELS.get(slug) ??
  slug
    .trim()
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export type ProductVariantInput = {
  weightGrams: number;
  price: number;
  compareAtPrice?: number | null;
  stockQty: number;
  sku: string;
};

export type ProductCreateInput = {
  name: string;
  description: string;
  categoryId: string;
  brandId: string | null;
  taxClassId: string | null;
  status: ProductStatus;
  cutTypes: string[];
  badge: ProductBadge | null;
  tags: string[];
  storefrontMeta: ProductStorefrontMeta;
  sortOrder?: number;
  variants: ProductVariantInput[];
};

export type ProductUpdateInput = {
  name: string;
  description: string;
  categoryId: string;
  brandId: string | null;
  taxClassId: string | null;
  status: ProductStatus;
  cutTypes: string[];
  tags: string;
  storefrontMeta: ProductStorefrontMeta;
  sortOrder?: number;
};

const toNumber = (value: unknown): number => {
  const n = typeof value === "string" ? Number(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const buildProductTags = (
  cutTypes: string[],
  badge: ProductBadge | null,
  userTags: string[],
): string => {
  const parts: string[] = [
    ...buildCutTypeTags(cutTypes),
  ];
  if (badge) parts.push(`badge:${badge}`);
  for (const tag of userTags) {
    const t = tag.trim();
    if (
      t &&
      !t.startsWith(CUT_TYPE_TAG_PREFIX) &&
      !t.startsWith("badge:")
    ) {
      parts.push(t);
    }
  }
  return parts.join(", ");
};

export const parseProductTags = (tags: string | null | undefined): {
  cutTypes: string[];
  cutType: string;
  badge: ProductBadge | null;
  userTags: string[];
} => {
  const parts = (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  let cutTypes: string[] = [];
  let badge: ProductBadge | null = null;
  const userTags: string[] = [];

  for (const part of parts) {
    if (part.startsWith(CUT_TYPE_TAG_PREFIX)) {
      const parsed = parseCutTypes(part.slice(CUT_TYPE_TAG_PREFIX.length));
      if (parsed.length > 0) {
        cutTypes = [...new Set([...cutTypes, ...parsed])];
      }
    } else if (part.startsWith("badge:")) {
      const value = part.slice(6).trim();
      if (value) badge = value;
    } else {
      userTags.push(part);
    }
  }

  if (cutTypes.length === 0) {
    cutTypes = [CUT_TYPES[0] ?? "Curry Cut"];
  }

  return {
    cutTypes,
    cutType: formatCutTypes(cutTypes),
    badge,
    userTags,
  };
};

const mapVariant = (raw: Record<string, unknown>): ProductVariant => {
  const price = toNumber(raw.price);
  const compareRaw = raw.compareAtPrice;
  const compareAtPrice =
    compareRaw != null && compareRaw !== ""
      ? toNumber(compareRaw)
      : null;

  return {
    id: String(raw.id),
    productId: String(raw.productId),
    weightGrams: toNumber(raw.weightGrams),
    sku: String(raw.sku ?? ""),
    price,
    compareAtPrice:
      compareAtPrice != null && compareAtPrice > price ? compareAtPrice : null,
    stockQty: toNumber(raw.stockQty),
    isActive: Boolean(raw.isActive ?? true),
  };
};

export const mapApiProductImage = (raw: Record<string, unknown>): ProductImage => ({
  id: String(raw.id),
  productId: String(raw.productId),
  url: String(raw.url ?? ""),
  altText: String(raw.alt ?? raw.name ?? "Product image"),
  isPrimary: Boolean(raw.isPrimary),
  sortOrder: toNumber(raw.sortOrder),
});

export const mapApiProductToCommerce = (raw: ApiProduct | Record<string, unknown>): Product => {
  const record = raw as ApiProduct;
  const variants = (record.variants ?? []).map((v) =>
    mapVariant(v as unknown as Record<string, unknown>),
  );
  const images = (record.images ?? []).map((img) =>
    mapApiProductImage(img as unknown as Record<string, unknown>),
  );

  const activeVariants = variants.filter((v) => v.isActive);
  const primaryVariant =
    activeVariants.sort((a, b) => a.weightGrams - b.weightGrams)[0] ?? variants[0];

  const status: ProductStatus = record.isActive ? "active" : "draft";

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description ?? "",
    brandId: record.brandId,
    brand: record.brand
      ? {
          id: record.brand.id,
          name: record.brand.name,
          logoUrl: record.brand.logoUrl ?? "",
        }
      : null,
    categoryId: record.categoryId,
    tags: record.tags ?? "",
    sortOrder: toNumber(record.sortOrder),
    category: record.category
      ? { id: record.category.id, name: record.category.name, slug: record.category.slug }
      : null,
    storefrontMeta: parseStorefrontMeta(
      (record as ApiProduct & { storefrontMeta?: unknown }).storefrontMeta,
    ),
    sku: primaryVariant?.sku ?? "",
    taxClassId: record.taxClassId,
    taxClass: record.taxClass
      ? { id: record.taxClass.id, name: record.taxClass.name }
      : null,
    price: primaryVariant?.price ?? 0,
    status,
    images,
    variants,
    hasVariants: variants.length > 0,
    stock: variants.reduce((sum, v) => sum + v.stockQty, 0),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

export const buildCreatePayload = (input: ProductCreateInput) => ({
  name: input.name.trim(),
  description: input.description.trim(),
  categoryId: input.categoryId,
  brandId: input.brandId || null,
  taxClassId: input.taxClassId || null,
  status: input.status,
  tags: buildProductTags(input.cutTypes, input.badge, input.tags),
  storefrontMeta: buildStorefrontMeta(input.storefrontMeta, input.cutTypes),
  sortOrder: input.sortOrder ?? 0,
  variants: input.variants.map((v) => ({
    weightGrams: v.weightGrams,
    price: v.price,
    compareAtPrice: v.compareAtPrice && v.compareAtPrice > v.price ? v.compareAtPrice : null,
    stockQty: v.stockQty,
    sku: v.sku.trim().toUpperCase(),
  })),
});

export const buildUpdatePayload = (input: ProductUpdateInput) => {
  const { tags, storefrontMeta, cutTypes, ...rest } = input;
  return {
    name: rest.name.trim(),
    description: rest.description.trim(),
    categoryId: rest.categoryId,
    brandId: rest.brandId || null,
    taxClassId: rest.taxClassId || null,
    status: rest.status,
    tags,
    sortOrder: rest.sortOrder ?? 0,
    storefrontMeta: buildStorefrontMeta(storefrontMeta, cutTypes),
  };
};
