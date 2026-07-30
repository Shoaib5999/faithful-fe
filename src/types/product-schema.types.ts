import type { AttributeType } from "@/types/master.types";

export interface ProductFieldDefinition {
  key: string;
  label: string;
  type: AttributeType | "currency" | "image" | "richtext" | "tag";
  required: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: string | number | boolean | null;
  group: "basic" | "pricing" | "seo" | "attributes" | "media" | "shipping";
  visibleIf?: (categoryId: string) => boolean;
}

export interface ProductTypeSchema {
  id: string;
  name: string;
  categoryId: string;
  fields: ProductFieldDefinition[];
  variantAttributes: string[];
  enableTieredPricing: boolean;
  enableDigital: boolean;
}

export interface ProductSEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  canonicalUrl: string | null;
  ogImageUrl: string | null;
}

export interface TieredPrice {
  id: string;
  minQuantity: number;
  maxQuantity: number | null;
  price: number;
  customerGroup: string | null;
}

/** Storefront section badges for home merchandising. */
export const STOREFRONT_COLLECTION_SLUGS = {
  NEW_ARRIVALS: "new-arrivals",
  BEST_SELLERS: "best-sellers",
} as const;

export interface ProductShipping {
  weight: number | null;
  weightUnit: string;
  length: number | null;
  width: number | null;
  height: number | null;
  dimensionUnit: string;
  isDigital: boolean;
  requiresShipping: boolean;
}

export const DEFAULT_SEO: ProductSEO = {
  metaTitle: "",
  metaDescription: "",
  metaKeywords: [],
  canonicalUrl: null,
  ogImageUrl: null,
};

export const DEFAULT_SHIPPING: ProductShipping = {
  weight: null,
  weightUnit: "kg",
  length: null,
  width: null,
  height: null,
  dimensionUnit: "cm",
  isDigital: false,
  requiresShipping: true,
};