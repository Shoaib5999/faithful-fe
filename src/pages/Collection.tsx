import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Grid2x2, LayoutGrid, PackageOpen, SlidersHorizontal } from "lucide-react";
import {
  CollectionFilterOverlay,
  type CollectionFilterDraft,
} from "@/components/storefront/CollectionFilterOverlay";
import { CollectionFiltersPanel } from "@/components/storefront/CollectionFiltersPanel";
import { CollectionSortMenu } from "@/components/storefront/CollectionSortMenu";
import { RevealText } from "@/components/storefront/motion/RevealText";
import { RevealTitle } from "@/components/storefront/motion/RevealTitle";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { productCardWrapClass } from "@/components/storefront/store-product-carousel.utils";
import {
  StoreGhostButton,
  StorePageContainer,
  StoreSkeletonGrid,
  storePageSectionClass,
  storePanelClass,
} from "@/components/storefront/storefront-ui";
import { StoreProductCard } from "@/components/storefront/StoreProductCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { COLLECTION_PAGE_SIZE } from "@/constants/collection.constants";
import {
  COLLECTION_SORT_OPTIONS,
  SHOP_CATEGORIES,
  collectionCategoryToParam,
  resolveCollectionCategorySlug,
  type CollectionSortId,
} from "@/constants/storefront.constants";
import {
  type CollectionQuickFilterId,
} from "@/services/storefront-product-service";
import { useStorefrontCollection } from "@/hooks/useStorefrontCollection";
import { useStorefrontBrands } from "@/hooks/useStorefrontBrands";
import { useStorefrontCategories } from "@/hooks/useStorefrontCategories";
import { useStorefrontFilterOptions } from "@/hooks/useStorefrontFilterOptions";
import { useIntersectionLoadMore } from "@/hooks/useIntersectionLoadMore";
import { useWishlist } from "@/hooks/useWishlist";
import { useIsMobile } from "@/hooks/use-mobile";
import { buildPriceRangeBuckets, type CatalogPriceBucket } from "@/lib/collection-price-buckets";
import { cn } from "@/lib/utils";

const FILTERS_STORAGE_KEY = "faithfulmeat:collection-filters:v1";

type SavedCollectionFilters = {
  brandSlug: string | null;
  categorySlug: string | null;
  priceMin: number | null;
  priceMax: number | null;
  quickFilters: CollectionQuickFilterId[];
};

const readSavedFilters = (): SavedCollectionFilters | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedCollectionFilters>;
    return {
      brandSlug: parsed.brandSlug ?? null,
      categorySlug: parsed.categorySlug ?? null,
      priceMin: parsed.priceMin ?? null,
      priceMax: parsed.priceMax ?? null,
      quickFilters: Array.isArray(parsed.quickFilters) ? parsed.quickFilters : [],
    };
  } catch {
    return null;
  }
};

const VALID_QUICK_FILTERS = new Set<CollectionQuickFilterId>([
  "best-sellers",
  "new-arrivals",
]);

const VALID_SORT_IDS = new Set<CollectionSortId>(
  COLLECTION_SORT_OPTIONS.map((option) => option.id),
);

const parseQuickFiltersFromUrl = (raw: string | null): CollectionQuickFilterId[] => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is CollectionQuickFilterId =>
      VALID_QUICK_FILTERS.has(part as CollectionQuickFilterId),
    );
};

const parseSortFromUrl = (raw: string | null): CollectionSortId =>
  raw && VALID_SORT_IDS.has(raw as CollectionSortId) ? (raw as CollectionSortId) : "newest";

const parseOptionalPrice = (raw: string | null): number | undefined => {
  if (raw === null) return undefined;
  const num = Number(raw);
  return Number.isFinite(num) ? num : undefined;
};

type GridDensity = "comfortable" | "compact";

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: brands = [] } = useStorefrontBrands();
  const { data: categories = [] } = useStorefrontCategories();
  const { data: filterOptions } = useStorefrontFilterOptions();
  const isMobile = useIsMobile();

  const query = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category");
  const cutTypeParam = searchParams.get("type");
  const cutTypeSlug = cutTypeParam?.trim() || null;
  const urlMinRaw = searchParams.get("min");
  const urlMaxRaw = searchParams.get("max");

  const [sort, setSort] = useState<CollectionSortId>("newest");
  const [gridDensity, setGridDensity] = useState<GridDensity>("comfortable");
  const [filterOverlayOpen, setFilterOverlayOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<CollectionFilterDraft>({
    sort: "newest",
    quickFilters: [],
    categorySlug: null,
    brandSlug: null,
    priceMin: undefined,
    priceMax: undefined,
  });
  const [brandSlug, setBrandSlug] = useState<string | null>(
    () => readSavedFilters()?.brandSlug ?? null,
  );
  const [categorySlug, setCategorySlug] = useState<string | null>(() => {
    if (categoryParam) return resolveCollectionCategorySlug(categoryParam);
    return readSavedFilters()?.categorySlug ?? null;
  });
  const [quickFilters, setQuickFilters] = useState<CollectionQuickFilterId[]>(
    () => readSavedFilters()?.quickFilters ?? [],
  );
  const [priceMin, setPriceMin] = useState<number | undefined>(() => {
    const urlNum = urlMinRaw !== null ? Number(urlMinRaw) : NaN;
    if (urlMinRaw !== null && Number.isFinite(urlNum)) return urlNum;
    return readSavedFilters()?.priceMin ?? undefined;
  });
  const [priceMax, setPriceMax] = useState<number | undefined>(() => {
    const urlNum = urlMaxRaw !== null ? Number(urlMaxRaw) : NaN;
    if (urlMaxRaw !== null && Number.isFinite(urlNum)) return urlNum;
    return readSavedFilters()?.priceMax ?? undefined;
  });

  const syncCategoryToUrl = useCallback(
    (slug: string | null) => {
      const next = new URLSearchParams(searchParams);
      const param = collectionCategoryToParam(slug);
      if (param) {
        next.set("category", param);
      } else {
        next.delete("category");
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const persistFilters = useCallback((patch: Partial<SavedCollectionFilters>) => {
    try {
      const current = readSavedFilters() ?? {
        brandSlug: null,
        categorySlug: null,
        priceMin: null,
        priceMax: null,
        quickFilters: [],
      };
      localStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify({ ...current, ...patch } satisfies SavedCollectionFilters),
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const hasFilterParams =
      Boolean(categoryParam) ||
      Boolean(searchParams.get("sort")) ||
      Boolean(searchParams.get("filter")) ||
      Boolean(searchParams.get("brand")) ||
      urlMinRaw !== null ||
      urlMaxRaw !== null;

    if (!hasFilterParams) return;

    const nextCategory = categoryParam ? resolveCollectionCategorySlug(categoryParam) : null;
    const nextSort = parseSortFromUrl(searchParams.get("sort"));
    const nextQuickFilters = parseQuickFiltersFromUrl(searchParams.get("filter"));
    const nextBrand = searchParams.get("brand");
    const nextPriceMin = parseOptionalPrice(urlMinRaw);
    const nextPriceMax = parseOptionalPrice(urlMaxRaw);

    setCategorySlug(nextCategory);
    setSort(nextSort);
    setQuickFilters(nextQuickFilters);
    setBrandSlug(nextBrand);
    setPriceMin(nextPriceMin);
    setPriceMax(nextPriceMax);

    persistFilters({
      brandSlug: nextBrand,
      categorySlug: nextCategory,
      priceMin: nextPriceMin ?? null,
      priceMax: nextPriceMax ?? null,
      quickFilters: nextQuickFilters,
    });
  }, [
    categoryParam,
    urlMinRaw,
    urlMaxRaw,
    searchParams,
    persistFilters,
  ]);

  const catalogPriceBounds = useMemo(() => {
    const min = filterOptions?.priceRange.min ?? 0;
    const max = filterOptions?.priceRange.max ?? 0;
    if (!max || max <= min) return null;
    const roundedMin = Math.floor(min / 100) * 100;
    const roundedMax = Math.ceil(max / 100) * 100;
    return roundedMin < roundedMax ? { min: roundedMin, max: roundedMax } : null;
  }, [filterOptions]);

  const priceBuckets = useMemo(
    () => buildPriceRangeBuckets(filterOptions?.priceRange.min, filterOptions?.priceRange.max),
    [filterOptions],
  );

  const collectionFilters = useMemo(
    () => ({
      limit: COLLECTION_PAGE_SIZE,
      query: query || undefined,
      sort,
      priceMin,
      priceMax,
      brandSlug: brandSlug || undefined,
      categorySlug: categorySlug || undefined,
      quickFilters: quickFilters.length ? quickFilters : undefined,
      cutTypeSlug: cutTypeSlug || undefined,
    }),
    [
      query,
      sort,
      priceMin,
      priceMax,
      brandSlug,
      categorySlug,
      quickFilters,
      cutTypeSlug,
    ],
  );

  const {
    data: collectionData,
    isPending: isCollectionLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useStorefrontCollection(collectionFilters);

  const items = useMemo(
    () => collectionData?.pages.flatMap((page) => page.products) ?? [],
    [collectionData],
  );
  const totalCount = collectionData?.pages[0]?.total ?? 0;
  const isGridLoading = isCollectionLoading && !collectionData;
  const canLoadMore = hasNextPage && items.length > 0 && items.length < totalCount;

  const loadMore = useCallback(() => {
    if (canLoadMore && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [canLoadMore, isFetchingNextPage, fetchNextPage]);

  const loadMoreRef = useIntersectionLoadMore(loadMore, {
    enabled: canLoadMore,
  });

  const { wishlistedById, wishlistUpdatingId, handleToggleWishlist } = useWishlist();

  const handleClearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    next.delete("category");
    next.delete("type");
    setSearchParams(next, { replace: true });
    setBrandSlug(null);
    setCategorySlug(null);
    setQuickFilters([]);
    setPriceMin(undefined);
    setPriceMax(undefined);
    try {
      localStorage.removeItem(FILTERS_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const availableBrandSlugs = useMemo(() => {
    const set = new Set<string>();
    for (const brand of brands) {
      if (brand.isActive && brand.slug) set.add(brand.slug);
    }
    return set;
  }, [brands]);

  const brandOptions = useMemo(() => {
    if (!brands.length) return [];
    return brands
      .filter((b) => b.isActive && availableBrandSlugs.has(b.slug))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [brands, availableBrandSlugs]);

  const availableCategorySlugs = useMemo(() => {
    const set = new Set<string>();
    for (const category of categories) {
      if (category.isActive && category.slug) set.add(category.slug);
    }
    for (const shop of SHOP_CATEGORIES) {
      set.add(shop.categorySlug);
    }
    return set;
  }, [categories]);

  const categoryOptions = useMemo(() => {
    const bySlug = new Map<string, (typeof categories)[number]>();

    for (const shop of SHOP_CATEGORIES) {
      const slug = shop.categorySlug;
      const master = categories.find((c) => c.slug === slug);
      bySlug.set(slug, {
        id: master?.id ?? shop.id,
        name: shop.label,
        slug,
        parentId: master?.parentId ?? null,
        isActive: true,
        sortOrder: master?.sortOrder ?? SHOP_CATEGORIES.findIndex((c) => c.id === shop.id),
      });
    }

    for (const category of categories) {
      if (!category.isActive || bySlug.has(category.slug)) continue;
      if (availableCategorySlugs.has(category.slug)) {
        bySlug.set(category.slug, category);
      }
    }

    return Array.from(bySlug.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, availableCategorySlugs]);

  const openFilterOverlay = () => {
    setFilterDraft({
      sort,
      quickFilters,
      categorySlug,
      brandSlug,
      priceMin,
      priceMax,
    });
    setFilterOverlayOpen(true);
  };

  const applyFilterDraft = () => {
    setSort(filterDraft.sort);
    setQuickFilters(filterDraft.quickFilters);
    setBrandSlug(filterDraft.brandSlug);
    setPriceMin(filterDraft.priceMin);
    setPriceMax(filterDraft.priceMax);

    if (filterDraft.categorySlug !== categorySlug) {
      setCategorySlug(filterDraft.categorySlug);
      syncCategoryToUrl(filterDraft.categorySlug);
    }

    persistFilters({
      brandSlug: filterDraft.brandSlug,
      categorySlug: filterDraft.categorySlug,
      priceMin: filterDraft.priceMin ?? null,
      priceMax: filterDraft.priceMax ?? null,
      quickFilters: filterDraft.quickFilters,
    });

    setFilterOverlayOpen(false);
  };

  const clearFilterDraft = () => {
    setFilterDraft({
      sort: "newest",
      quickFilters: [],
      categorySlug: null,
      brandSlug: null,
      priceMin: undefined,
      priceMax: undefined,
    });
    setSort("newest");
    handleClearFilters();
  };

  useEffect(() => {
    if (!isMobile && filterOverlayOpen) {
      setFilterOverlayOpen(false);
    }
  }, [isMobile, filterOverlayOpen]);

  const handleToggleQuickFilter = (id: CollectionQuickFilterId) => {
    setQuickFilters((prev) => {
      const next = prev.includes(id) ? [] : [id];
      persistFilters({ quickFilters: next });
      return next;
    });
  };

  const handleCategorySelect = (slug: string) => {
    setCategorySlug((prev) => {
      const next = prev === slug ? null : slug;
      syncCategoryToUrl(next);
      persistFilters({ categorySlug: next });
      return next;
    });
  };

  const handleBrandSelect = (slug: string) => {
    setBrandSlug((prev) => {
      const next = prev === slug ? null : slug;
      persistFilters({ brandSlug: next });
      return next;
    });
  };

  const handlePriceBucketSelect = (bucket: CatalogPriceBucket) => {
    const isSelected = priceMin === bucket.min && priceMax === bucket.max;
    const nextMin = isSelected ? undefined : bucket.min;
    const nextMax = isSelected ? undefined : bucket.max;
    setPriceMin(nextMin);
    setPriceMax(nextMax);
    persistFilters({ priceMin: nextMin ?? null, priceMax: nextMax ?? null });
  };

  const handleClearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const productGridClass = cn(
    "grid gap-3 sm:gap-3.5 xl:gap-4",
    gridDensity === "comfortable"
      ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3",
  );

  const collectionSubtitle = useMemo(() => {
    const names = categoryOptions.map((c) => c.name.toLowerCase());
    if (names.length === 0) {
      return "Discover our range of fresh chicken, mutton, fish, and seafood.";
    }
    if (names.length === 1) return `Discover our range of ${names[0]} products.`;
    const last = names[names.length - 1];
    const rest = names.slice(0, -1).join(", ");
    return `Discover our range of ${rest}, and ${last} products.`;
  }, [categoryOptions]);

  const hasActiveFilters = useMemo(
    () =>
      quickFilters.length > 0 ||
      categorySlug !== null ||
      brandSlug !== null ||
      priceMin !== undefined ||
      priceMax !== undefined ||
      query.trim().length > 0 ||
      sort !== "newest",
    [quickFilters, categorySlug, brandSlug, priceMin, priceMax, query, sort],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (quickFilters.length > 0) count++;
    if (categorySlug !== null) count++;
    if (brandSlug !== null) count++;
    if (priceMin !== undefined || priceMax !== undefined) count++;
    if (query.trim().length > 0) count++;
    if (sort !== "newest") count++;
    return count;
  }, [quickFilters, categorySlug, brandSlug, priceMin, priceMax, query, sort]);

  return (
    <StorePageShell>
      <StorePageContainer
        className={cn(storePageSectionClass, "max-w-[1600px] pt-8 md:pt-10")}
      >
        <header className="max-w-3xl">
          <Breadcrumb>
            <BreadcrumbList className="gap-1.5 font-store-body text-xs text-[var(--store-muted)] sm:text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="hover:text-[var(--store-ink)]">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-[var(--store-muted)] [&>svg]:h-3 [&>svg]:w-3" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-store-body text-[var(--store-ink)]">Shop</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <RevealTitle
            as="h1"
            className="mt-4  text-2xl font-bold uppercase tracking-wide text-[var(--store-red)] md:mt-5 md:text-3xl"
          >
            Our Collection
          </RevealTitle>
          <RevealText
            as="p"
            delay={100}
            className="mt-2 font-store-body text-sm leading-relaxed text-[var(--store-muted)] md:mt-3 md:text-base"
          >
            {collectionSubtitle}
          </RevealText>
        </header>

        <section className="mt-8 border-t border-black/10 pt-8 md:pt-10">
          {/* Mobile — single compact toolbar row */}
          <div className="flex items-center gap-2 border-b border-black/10 pb-4 md:hidden">
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={openFilterOverlay}
                aria-label={
                  activeFilterCount > 0
                    ? `Filters, ${activeFilterCount} applied`
                    : "Filters"
                }
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border bg-white py-1.5 pl-1.5 pr-3 font-store-body text-xs font-semibold text-[var(--store-ink)] shadow-sm transition-colors",
                  hasActiveFilters
                    ? "border-[var(--store-red)] bg-[var(--store-red)]/5 text-[var(--store-red-dark)]"
                    : "border-black/15 hover:border-[var(--store-red)] hover:text-[var(--store-red)]",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full",
                    hasActiveFilters
                      ? "bg-[var(--store-red)]/15 text-[var(--store-red-dark)]"
                      : "bg-[var(--store-cream)] text-[var(--store-ink)]",
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </span>
                Filters
                {activeFilterCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--store-red-dark)] px-1.5 font-store-body text-[10px] font-bold leading-none text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilterDraft}
                  className="font-store-body text-[10px] font-medium text-[var(--store-muted)] underline-offset-2 hover:text-[var(--store-red)] hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div
              className={cn(storePanelClass, "ml-auto inline-flex shrink-0 items-center gap-0.5 p-0.5")}
              role="group"
              aria-label="Grid density"
            >
              <button
                type="button"
                aria-pressed={gridDensity === "comfortable"}
                onClick={() => setGridDensity("comfortable")}
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  gridDensity === "comfortable"
                    ? "bg-[var(--store-cream)] text-[var(--store-red)]"
                    : "text-[var(--store-muted)] hover:text-[var(--store-red)]",
                )}
                aria-label="Dense grid"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-pressed={gridDensity === "compact"}
                onClick={() => setGridDensity("compact")}
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  gridDensity === "compact"
                    ? "bg-[var(--store-cream)] text-[var(--store-red)]"
                    : "text-[var(--store-muted)] hover:text-[var(--store-red)]",
                )}
                aria-label="Spacious grid"
              >
                <Grid2x2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop toolbar */}
          <div className="hidden flex-col gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-center sm:justify-end sm:gap-6 md:flex">
            <div className="flex flex-wrap items-center gap-3">
              <CollectionSortMenu value={sort} onChange={setSort} />
              <div
                className={cn(storePanelClass, "inline-flex w-fit items-center gap-0.5 p-1")}
                role="group"
                aria-label="Grid density"
              >
              <button
                type="button"
                aria-pressed={gridDensity === "comfortable"}
                onClick={() => setGridDensity("comfortable")}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  gridDensity === "comfortable"
                    ? "bg-[var(--store-cream)] text-[var(--store-red)]"
                    : "text-[var(--store-muted)] hover:text-[var(--store-red)]",
                )}
                aria-label="Dense grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-pressed={gridDensity === "compact"}
                onClick={() => setGridDensity("compact")}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  gridDensity === "compact"
                    ? "bg-[var(--store-cream)] text-[var(--store-red)]"
                    : "text-[var(--store-muted)] hover:text-[var(--store-red)]",
                )}
                aria-label="Spacious grid"
              >
                <Grid2x2 className="h-4 w-4" />
              </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
            <aside className="hidden md:block md:w-full lg:w-64 lg:shrink-0 xl:w-72">
              <CollectionFiltersPanel
                quickFilters={quickFilters}
                onToggleQuickFilter={handleToggleQuickFilter}
                categoryOptions={categoryOptions}
                categorySlug={categorySlug}
                onCategorySelect={handleCategorySelect}
                priceBuckets={priceBuckets}
                priceMin={priceMin}
                priceMax={priceMax}
                onPriceBucketSelect={handlePriceBucketSelect}
                brandOptions={brandOptions}
                brandSlug={brandSlug}
                onBrandSelect={handleBrandSelect}
                onClearFilters={handleClearFilters}
                searchQuery={query}
                onClearSearch={query ? handleClearSearch : undefined}
              />
            </aside>

            <div className="min-w-0 flex-1">

            {isGridLoading && <StoreSkeletonGrid count={8} className="mt-8" />}

            {!isGridLoading && items.length > 0 ? (
              <>
                <div className={cn(productGridClass, "mt-8")}>
                  {items.map((product) => (
                    <div key={product.id} className={productCardWrapClass}>
                      <StoreProductCard
                        product={product}
                        inlineActions
                        wishlisted={Boolean(wishlistedById[product.id])}
                        isWishlistUpdating={wishlistUpdatingId === product.id}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    </div>
                  ))}
                </div>
                <div ref={loadMoreRef} className="mt-8 flex min-h-10 justify-center" aria-hidden>
                  {isFetchingNextPage ? (
                    <p className="font-store-body text-sm text-[var(--store-muted)]">Loading more products…</p>
                  ) : canLoadMore ? (
                    <p className="sr-only">More products load as you scroll</p>
                  ) : null}
                </div>
              </>
            ) : null}

            {!isGridLoading && items.length === 0 ? (
              <div className={cn(storePanelClass, "mt-16 px-6 py-20 text-center")}>
                <PackageOpen className="mx-auto mb-4 h-10 w-10 text-[var(--store-muted)]/40" />
                <RevealTitle
                  as="h2"
                  className=" text-xl font-bold uppercase tracking-wide text-[var(--store-ink)]"
                >
                  No products found
                </RevealTitle>
                <p className="mt-3 font-store-body text-sm text-[var(--store-muted)]">
                  No products match your current filters. Try adjusting or clearing them.
                </p>
                <StoreGhostButton
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-8 border-[var(--store-red)] text-[var(--store-red)] hover:bg-[var(--store-red)] hover:text-white"
                >
                  Clear filters
                </StoreGhostButton>
              </div>
            ) : null}
            </div>
          </div>
        </section>
      </StorePageContainer>

      {isMobile ? (
        <CollectionFilterOverlay
          open={filterOverlayOpen}
          onOpenChange={setFilterOverlayOpen}
          draft={filterDraft}
          onDraftChange={setFilterDraft}
          onApply={applyFilterDraft}
          onClearAll={clearFilterDraft}
          categoryOptions={categoryOptions}
          brandOptions={brandOptions}
          priceBounds={catalogPriceBounds}
        />
      ) : null}
    </StorePageShell>
  );
}
