import { api } from "@/services/api";
import type { CollectionSortId } from "@/constants/storefront.constants";
import { COLLECTION_PAGE_SIZE } from "@/constants/collection.constants";
import { parseProductTags } from "@/lib/product-api";
import { parseStorefrontMeta } from "@/lib/product-storefront-meta";
import { productMatchesCutTypeSlug } from "@/lib/cut-type-match";
import { STOREFRONT_COLLECTION_SLUGS } from "@/types/product-schema.types";
import type { StorefrontProductApi } from "@/types/product.types";
import { mapApiToStoreProductDetail } from "@/lib/store-product-detail";
import type { StoreProductDetail } from "@/lib/store-product-detail";
import type { HomeProduct } from "@/types/storefront-catalog.types";

export const mapApiProductToHomeProduct = (raw: StorefrontProductApi): HomeProduct => {
  const detail = mapApiToStoreProductDetail(raw);
  const primary = detail.variants.find((v) => v.isAvailable) ?? detail.variants[0];
  const categorySlug = raw.category?.slug?.toLowerCase() ?? "";
  const brandSlug = raw.brand?.slug?.toLowerCase() ?? null;
  const brandName = raw.brand?.name ?? null;
  const { cutTypes } = parseProductTags(raw.tags);

  return {
    id: detail.id,
    slug: detail.slug,
    name: detail.name,
    cutTypes,
    image: detail.image,
    price: primary?.price ?? detail.price,
    compareAtPrice: primary?.compareAtPrice ?? detail.compareAtPrice,
    badge: detail.badge as HomeProduct["badge"],
    sizes: detail.variants.map((v) => ({
      label: v.label,
      isAvailable: v.isAvailable,
      variantId: v.id,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
    })),
    categorySlug,
    brandSlug,
    brandName,
    rating: detail.rating,
    reviewCount: detail.reviewCount,
    createdAt: raw.createdAt,
    storefrontMeta: parseStorefrontMeta(raw.storefrontMeta),
    sortOrder: Number(raw.sortOrder ?? 0),
  };
};

const STOREFRONT_CATALOG_LIMIT = 100;

export const fetchStorefrontCatalog = async (): Promise<HomeProduct[]> => {
  const data = await api.get<{ products: StorefrontProductApi[] }>("/products", {
    limit: STOREFRONT_CATALOG_LIMIT,
  });

  return (data.products ?? []).filter((p) => p.isActive).map(mapApiProductToHomeProduct);
};

export type StorefrontCollectionParams = {
  page?: number;
  limit?: number;
  query?: string;
  sort?: CollectionSortId;
  priceMin?: number;
  priceMax?: number;
  brandSlug?: string | null;
  categorySlug?: string | null;
  quickFilters?: CollectionQuickFilterId[];
  cutTypeSlug?: string | null;
};

export type StorefrontCollectionPage = {
  products: HomeProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const mapCollectionSortToApi = (sort: CollectionSortId | undefined): string | undefined => {
  switch (sort) {
    case "name-asc":
      return "name_asc";
    case "name-desc":
      return "name_desc";
    case "price-asc":
      return "price_asc";
    case "price-desc":
      return "price_desc";
    case "newest":
      return "newest";
    case "featured":
    case "best-selling":
    default:
      return undefined;
  }
};

export const fetchStorefrontCollectionPage = async (
  params: StorefrontCollectionParams = {},
): Promise<StorefrontCollectionPage> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? COLLECTION_PAGE_SIZE;
  const search = params.query?.trim();
  const sortBy = mapCollectionSortToApi(params.sort);
  const quickFilters = params.quickFilters?.length
    ? params.quickFilters.join(",")
    : undefined;

  const data = await api.get<{
    products: StorefrontProductApi[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>("/products", {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(params.priceMin !== undefined ? { minPrice: params.priceMin } : {}),
    ...(params.priceMax !== undefined ? { maxPrice: params.priceMax } : {}),
    ...(params.brandSlug ? { brandSlug: params.brandSlug } : {}),
    ...(params.categorySlug ? { categorySlug: params.categorySlug } : {}),
    ...(quickFilters ? { quickFilters } : {}),
    ...(params.cutTypeSlug ? { cutTypeSlug: params.cutTypeSlug } : {}),
  });

  const products = (data.products ?? [])
    .filter((p) => p.isActive)
    .map(mapApiProductToHomeProduct);

  const total = data.total ?? products.length;
  const resolvedLimit = data.limit ?? limit;
  const resolvedPage = data.page ?? page;
  const totalPages =
    data.totalPages ?? Math.max(1, Math.ceil(total / resolvedLimit) || 1);

  return {
    products,
    total,
    page: resolvedPage,
    limit: resolvedLimit,
    totalPages,
  };
};

export const fetchStorefrontProductBySlug = async (slug: string): Promise<StoreProductDetail> => {
  const data = await api.get<StorefrontProductApi>(`/products/slug/${slug}`);
  return mapApiToStoreProductDetail(data);
};

export type CollectionQuickFilterId = "best-sellers" | "new-arrivals";

export type CatalogFilterOptions = {
  query?: string;
  sort?:
    | "newest"
    | "featured"
    | "best-selling"
    | "name-asc"
    | "name-desc"
    | "price-asc"
    | "price-desc";
  priceMin?: number;
  priceMax?: number;
  brandSlug?: string | null;
  categorySlug?: string | null;
  quickFilters?: CollectionQuickFilterId[];
  cutTypeSlug?: string | null;
};

export const filterStorefrontCatalog = (
  catalog: HomeProduct[],
  options: CatalogFilterOptions,
): HomeProduct[] => {
  let list = catalog.slice();

  if (options.priceMin !== undefined) {
    list = list.filter((p) => p.price >= options.priceMin!);
  }
  if (options.priceMax !== undefined) {
    list = list.filter((p) => p.price <= options.priceMax!);
  }

  if (options.brandSlug) {
    list = list.filter((p) => p.brandSlug === options.brandSlug);
  }

  if (options.categorySlug) {
    list = list.filter((p) => p.categorySlug === options.categorySlug);
  }

  if (options.cutTypeSlug) {
    list = list.filter((p) =>
      productMatchesCutTypeSlug(p.cutTypes, options.cutTypeSlug!),
    );
  }

  if (options.quickFilters?.length) {
    list = list.filter((p) =>
      options.quickFilters!.every((q) => {
        if (q === "new-arrivals") return p.badge === STOREFRONT_COLLECTION_SLUGS.NEW_ARRIVALS;
        if (q === "best-sellers") return p.badge === STOREFRONT_COLLECTION_SLUGS.BEST_SELLERS;
        return false;
      }),
    );
  }

  const q = options.query?.trim().toLowerCase();
  if (q) {
    const normalizedQ = q.replace(/-/g, " ").replace(/_/g, " ");
    list = list.filter((p) => {
      const cutTypeLabel = p.cutTypes.join(" ").toLowerCase();
      return (
        p.name.toLowerCase().includes(normalizedQ) ||
        cutTypeLabel.includes(normalizedQ) ||
        p.slug.toLowerCase().includes(normalizedQ) ||
        p.categorySlug.toLowerCase().includes(normalizedQ)
      );
    });
  }

  switch (options.sort) {
    case "newest":
      list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      break;
    case "name-asc":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      list.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "best-selling":
      list.sort((a, b) => Number(Boolean(b.badge)) - Number(Boolean(a.badge)));
      break;
    default:
      break;
  }

  return list;
};

export const fetchRelatedStorefrontProducts = async (
  slug: string,
  categorySlug: string | undefined,
  limit = 8,
): Promise<HomeProduct[]> => {
  const data = await api.get<{
    products: StorefrontProductApi[];
  }>("/products", {
    ...(categorySlug ? { categorySlug } : {}),
    limit: 50,
  });

  return (data.products ?? [])
    .filter((p) => p.slug !== slug && p.isActive)
    .map(mapApiProductToHomeProduct)
    .slice(0, limit);
};

export type StorefrontReview = {
  id: string;
  name: string;
  initials: string;
  city: string;
  date: string;
  rating: number;
  title: string;
  body: string;
  helpfulCount: number;
};

type ReviewBreakdownRow = { rating: number; _count: { rating: number } };

export type StorefrontReviewStats = {
  average: number;
  total: number;
  breakdown: Array<{ stars: number; count: number }>;
};

const mapReviewStats = (
  stats:
    | { avgRating?: number; totalReviews?: number; breakdown?: ReviewBreakdownRow[] }
    | undefined,
  fallbackTotal: number,
): StorefrontReviewStats => {
  const counts = new Map<number, number>();
  for (const row of stats?.breakdown ?? []) {
    counts.set(row.rating, row._count.rating);
  }
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: counts.get(stars) ?? 0,
  }));
  const total = stats?.totalReviews ?? fallbackTotal;
  return {
    average: stats?.avgRating ?? 0,
    total,
    breakdown,
  };
};

export const fetchStorefrontProductReviews = async (
  productId: string,
  page = 1,
  limit = 20,
): Promise<{
  reviews: StorefrontReview[];
  total: number;
  avgRating: number;
  stats: StorefrontReviewStats;
}> => {
  const data = await api.get<{
    reviews: Array<{
      id: string;
      rating: number;
      title: string | null;
      comment: string | null;
      createdAt: string;
      user?: { name?: string | null };
    }>;
    total: number;
    stats?: {
      avgRating?: number;
      totalReviews?: number;
      breakdown?: ReviewBreakdownRow[];
    };
  }>(`/reviews/product/${productId}`, { page, limit });

  const reviews = (data.reviews ?? []).map((r) => {
    const name = r.user?.name?.trim() || "Faithful Meat Customer";
    const parts = name.split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

    return {
      id: r.id,
      name,
      initials,
      city: "India",
      date: new Date(r.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      rating: r.rating,
      title: r.title ?? "Customer review",
      body: r.comment ?? "",
      helpfulCount: 0,
    };
  });

  const total = data.total ?? reviews.length;
  const stats = mapReviewStats(data.stats, total);

  return {
    reviews,
    total,
    avgRating: stats.average,
    stats,
  };
};
