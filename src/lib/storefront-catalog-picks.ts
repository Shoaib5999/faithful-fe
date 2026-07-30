import { STOREFRONT_COLLECTION_SLUGS } from "@/types/product-schema.types";
import type { HomeProduct } from "@/types/storefront-catalog.types";
import { getProductsWithMeta } from "@/types/storefront-catalog.types";

const sortByDisplayOrder = (products: HomeProduct[]): HomeProduct[] =>
  [...products].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });

/** Flat "Best Selling Products" grid — products tagged `badge:best-sellers`. */
export const selectBestsellers = (
  catalog: HomeProduct[],
  limit = 12,
): HomeProduct[] => {
  const withBadge = catalog.filter(
    (p) => p.badge === STOREFRONT_COLLECTION_SLUGS.BEST_SELLERS,
  );
  const list = sortByDisplayOrder(withBadge.length > 0 ? withBadge : catalog).slice(0, limit);
  return getProductsWithMeta(list);
};

export const selectNewArrivals = (
  catalog: HomeProduct[],
  limit = 4,
): HomeProduct[] => {
  const withNew = catalog.filter((p) => p.badge === STOREFRONT_COLLECTION_SLUGS.NEW_ARRIVALS);
  const rest = catalog.filter((p) => p.badge !== STOREFRONT_COLLECTION_SLUGS.NEW_ARRIVALS);
  const list = sortByDisplayOrder([...withNew, ...rest]).slice(0, limit);
  return getProductsWithMeta(list.length > 0 ? list : sortByDisplayOrder(catalog).slice(0, limit));
};

/** Products belonging to a single category (e.g. for category-focused rails). */
export const selectCategoryProducts = (
  catalog: HomeProduct[],
  categorySlug: string,
  limit = 12,
): HomeProduct[] => {
  const matched = catalog.filter((p) => p.categorySlug === categorySlug);
  return getProductsWithMeta(sortByDisplayOrder(matched).slice(0, limit));
};
