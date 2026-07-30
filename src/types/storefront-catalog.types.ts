import type { ProductStorefrontMeta } from "@/types/product-storefront-meta";

export type HomeProductBadge = string;

export type HomeProduct = {
  id: string;
  slug: string;
  name: string;
  cutTypes: string[];
  image: string;
  price: number;
  compareAtPrice: number;
  badge?: HomeProductBadge;
  sizes: {
    label: string;
    isAvailable: boolean;
    variantId: string;
    price: number;
    compareAtPrice: number;
  }[];
  /** Backend category slug, e.g. chicken, mutton, fish, seafood */
  categorySlug: string;
  sortOrder?: number;
  /** Storefront brand identity (nullable if product has no brand). */
  brandSlug: string | null;
  brandName: string | null;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  storefrontMeta?: ProductStorefrontMeta;
};

export const getDiscountPercent = (price: number, compareAtPrice: number): number => {
  if (compareAtPrice <= price || compareAtPrice <= 0) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

export const getProductsWithMeta = (products: HomeProduct[]): HomeProduct[] =>
  products.map((p) => ({
    ...p,
    rating: p.rating ?? 0,
    reviewCount: p.reviewCount ?? 0,
  }));
