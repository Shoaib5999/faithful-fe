import { useEffect, useMemo, useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  PRODUCTS_LIST_QK,
} from "@/services/product-service";
import { fetchOrders, ORDERS_QK } from "@/services/order-service";
import { fetchCoupons, getAllCoupons } from "@/services/coupon-service";
import {
  getNavigationSearchHits,
  matchesCouponsTopic,
  type GlobalSearchNavHit,
} from "@/lib/global-search";
import { fetchReviews } from "@/services/review-service";
import { getAllCustomers } from "@/services/customer-service";
import type { Product, Order, Customer } from "@/types/commerce.types";
import type { Coupon } from "@/types/coupon.types";
import type { Slider, Review } from "@/types/cms.types";

export const COUPONS_QK = ["coupons"] as const;
export const REVIEWS_QK = ["reviews"] as const;

export interface SearchResults {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  navigation: GlobalSearchNavHit[];
  sliders: Slider[];
  reviews: Review[];
  totalCount: number;
}

function resolveCouponsFromCache(queryClient: QueryClient): Coupon[] {
  const fromQuery = queryClient.getQueryData<Coupon[]>(COUPONS_QK);
  if (Array.isArray(fromQuery) && fromQuery.length > 0) return fromQuery;
  return getAllCoupons();
}

function match(query: string, ...fields: (string | number | null | undefined)[]): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;
  const haystack = fields
    .filter((f) => f !== null && f !== undefined && String(f).trim() !== "")
    .map((f) => String(f).toLowerCase())
    .join(" ");
  return haystack.includes(q);
}

const MAX_PER_GROUP = 5;

export function useGlobalSearch(debouncedQuery: string): SearchResults & { isFetching: boolean } {
  const queryClient = useQueryClient();
  const [cacheSeq, setCacheSeq] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const trimmed = debouncedQuery.trim();

  useEffect(() => {
    const unsub = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === "updated" || event?.type === "added") {
        setCacheSeq((n) => n + 1);
      }
    });
    return unsub;
  }, [queryClient]);

  useEffect(() => {
    if (!trimmed) {
      setIsFetching(false);
      return;
    }

    let cancelled = false;
    setIsFetching(true);

    void (async () => {
      try {
        await Promise.all([
          queryClient.ensureQueryData({ queryKey: PRODUCTS_LIST_QK, queryFn: fetchProducts }),
          queryClient.ensureQueryData({ queryKey: ORDERS_QK, queryFn: fetchOrders }),
          queryClient.ensureQueryData({ queryKey: COUPONS_QK, queryFn: fetchCoupons }),
          queryClient.ensureQueryData({ queryKey: REVIEWS_QK, queryFn: fetchReviews }),
        ]);
      } finally {
        if (!cancelled) {
          setIsFetching(false);
          setCacheSeq((n) => n + 1);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [trimmed, queryClient]);

  const results = useMemo((): SearchResults => {
    const empty: SearchResults = {
      products: [],
      orders: [],
      customers: [],
      coupons: [],
      navigation: [],
      sliders: [],
      reviews: [],
      totalCount: 0,
    };
    if (!trimmed) return empty;

    const q = trimmed;

    const productList = queryClient.getQueryData<Product[]>(PRODUCTS_LIST_QK) ?? [];
    const products = productList
      .filter((p) =>
        match(
          q,
          p.name,
          p.slug,
          p.sku,
          p.tags,
          p.description,
          p.brand?.name,
          ...p.variants.map((v) => v.sku),
        ),
      )
      .slice(0, MAX_PER_GROUP);

    const orderRows = queryClient.getQueryData<Order[]>(ORDERS_QK) ?? [];
    const orders = orderRows
      .filter((o) =>
        match(
          q,
          o.orderNumber,
          o.id,
          o.couponCode,
          o.paymentMethod,
          o.status,
          `${o.customer.firstName} ${o.customer.lastName}`,
          o.customer.email,
          o.customer.phone,
        ),
      )
      .slice(0, MAX_PER_GROUP);

    const customers = getAllCustomers()
      .filter((c) =>
        match(q, `${c.firstName} ${c.lastName}`, c.email, c.phone, c.gstNumber, c.gstBusinessName),
      )
      .slice(0, MAX_PER_GROUP);

    const coupons = resolveCouponsFromCache(queryClient);
    const couponsTopic = matchesCouponsTopic(q);
    const couponMatches = coupons
      .filter(
        (c) =>
          couponsTopic ||
          match(q, c.code, c.type, "coupon", "coupons"),
      )
      .slice(0, MAX_PER_GROUP);

    const navigation = getNavigationSearchHits(q);

    const sliders: Slider[] = [];

    const reviews =
      queryClient.getQueryData<Review[]>(REVIEWS_QK) ?? [];
    const reviewMatches = reviews
      .filter((r) => match(q, r.productName, r.customerName, r.title, r.body))
      .slice(0, MAX_PER_GROUP);

    const totalCount =
      products.length +
      orders.length +
      customers.length +
      couponMatches.length +
      navigation.length +
      sliders.length +
      reviewMatches.length;

    return {
      products,
      orders,
      customers,
      coupons: couponMatches,
      navigation,
      sliders,
      reviews: reviewMatches,
      totalCount,
    };
  }, [trimmed, queryClient, cacheSeq]);

  return { ...results, isFetching };
}
