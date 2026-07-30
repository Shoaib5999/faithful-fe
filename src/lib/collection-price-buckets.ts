import type { HomeProduct } from "@/types/storefront-catalog.types";

export type CatalogPriceBucket = {
  id: string;
  label: string;
  min?: number;
  max?: number;
};

/** Standard INR steps; only buckets with ≥1 product in `products` are returned. */
const BOUNDARIES = [500, 1000, 2000, 3000, 5000, 7500, 10000] as const;

const formatInr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const productInBucket = (price: number, min?: number, max?: number) => {
  if (min !== undefined && max !== undefined) return price >= min && price <= max;
  if (max !== undefined) return price < max;
  if (min !== undefined) return price >= min;
  return true;
};

/** Build standard INR price buckets for a min/max range (collection filter UI). */
export const buildPriceRangeBuckets = (minPrice = 0, maxPrice = 0): CatalogPriceBucket[] => {
  if (!maxPrice || maxPrice <= 0) return [];

  const buckets: CatalogPriceBucket[] = [];
  const underFirst: CatalogPriceBucket = {
    id: `under-${BOUNDARIES[0]}`,
    label: `Under ${formatInr(BOUNDARIES[0])}`,
    max: BOUNDARIES[0],
  };
  if ((minPrice ?? 0) < BOUNDARIES[0]) buckets.push(underFirst);

  for (let i = 0; i < BOUNDARIES.length - 1; i++) {
    const min = BOUNDARIES[i];
    const max = BOUNDARIES[i + 1];
    if (max < minPrice || min > maxPrice) continue;
    buckets.push({
      id: `${min}-${max}`,
      label: `${formatInr(min)} - ${formatInr(max)}`,
      min,
      max,
    });
  }

  const last = BOUNDARIES[BOUNDARIES.length - 1];
  if (maxPrice >= last) {
    buckets.push({
      id: `above-${last}`,
      label: `Above ${formatInr(last)}`,
      min: last,
    });
  }

  return buckets;
};

export const buildCatalogPriceBuckets = (products: HomeProduct[]): CatalogPriceBucket[] => {
  const prices = products.map((p) => p.price).filter((p) => Number.isFinite(p) && p > 0);
  if (!prices.length) return [];

  const buckets: CatalogPriceBucket[] = [];

  const underFirst: CatalogPriceBucket = {
    id: `under-${BOUNDARIES[0]}`,
    label: `Under ${formatInr(BOUNDARIES[0])}`,
    max: BOUNDARIES[0],
  };
  if (prices.some((p) => productInBucket(p, undefined, underFirst.max))) {
    buckets.push(underFirst);
  }

  for (let i = 0; i < BOUNDARIES.length - 1; i++) {
    const min = BOUNDARIES[i];
    const max = BOUNDARIES[i + 1];
    const bucket: CatalogPriceBucket = {
      id: `${min}-${max}`,
      label: `${formatInr(min)} - ${formatInr(max)}`,
      min,
      max,
    };
    if (prices.some((p) => productInBucket(p, min, max))) {
      buckets.push(bucket);
    }
  }

  const last = BOUNDARIES[BOUNDARIES.length - 1];
  const aboveLast: CatalogPriceBucket = {
    id: `above-${last}`,
    label: `Above ${formatInr(last)}`,
    min: last,
  };
  if (prices.some((p) => productInBucket(p, aboveLast.min, undefined))) {
    buckets.push(aboveLast);
  }

  return buckets;
};
