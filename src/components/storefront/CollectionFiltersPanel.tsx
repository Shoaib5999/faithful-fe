import { useMemo, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Sparkles, Star, X } from "lucide-react";
import { storeFieldLabelClass, storePanelClass } from "@/components/storefront/storefront-ui";
import type { CatalogPriceBucket } from "@/lib/collection-price-buckets";
import type { CollectionQuickFilterId } from "@/services/storefront-product-service";
import type { Brand, Category } from "@/types/master.types";
import { cn } from "@/lib/utils";

const OTHER_FILTERS: Array<{
  id: CollectionQuickFilterId;
  label: string;
  Icon: LucideIcon;
}> = [
  { id: "best-sellers", label: "Bestsellers", Icon: Star },
  { id: "new-arrivals", label: "New Arrivals", Icon: Sparkles },
];

const QUICK_FILTER_LABELS: Record<CollectionQuickFilterId, string> = {
  "best-sellers": "Bestsellers",
  "new-arrivals": "New Arrivals",
};

type FilterChipProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: LucideIcon;
};

function FilterChip({ active, onClick, children, icon: Icon }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-store-body text-xs font-medium transition-colors",
        active
          ? "border-[var(--store-red)] bg-[var(--store-cream)] text-[var(--store-red)]"
          : "border-black/10 text-[var(--store-muted)] hover:border-[var(--store-red)]/50 hover:text-[var(--store-ink)]",
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
      {children}
    </button>
  );
}

type ActiveFilterChipProps = {
  label: string;
  onRemove: () => void;
};

function ActiveFilterChip({ label, onRemove }: ActiveFilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[var(--store-cream)] px-2.5 py-1 font-store-body text-xs font-medium text-[var(--store-ink)]",
        "animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-200 fill-mode-both",
      )}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--store-muted)] transition-colors hover:bg-black/5 hover:text-[var(--store-ink)]"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export type CollectionFiltersPanelProps = {
  quickFilters: CollectionQuickFilterId[];
  onToggleQuickFilter: (id: CollectionQuickFilterId) => void;
  categoryOptions: Category[];
  categorySlug: string | null;
  onCategorySelect: (slug: string) => void;
  priceBuckets: CatalogPriceBucket[];
  priceMin?: number;
  priceMax?: number;
  onPriceBucketSelect: (bucket: CatalogPriceBucket) => void;
  brandOptions: Brand[];
  brandSlug: string | null;
  onBrandSelect: (slug: string) => void;
  onClearFilters: () => void;
  searchQuery?: string;
  onClearSearch?: () => void;
  className?: string;
};

export function CollectionFiltersPanel({
  quickFilters,
  onToggleQuickFilter,
  categoryOptions,
  categorySlug,
  onCategorySelect,
  priceBuckets,
  priceMin,
  priceMax,
  onPriceBucketSelect,
  brandOptions,
  brandSlug,
  onBrandSelect,
  onClearFilters,
  searchQuery = "",
  onClearSearch,
  className,
}: CollectionFiltersPanelProps) {
  const isPriceBucketSelected = (bucket: CatalogPriceBucket) =>
    priceMin === bucket.min && priceMax === bucket.max;

  const selectedPriceBucket = priceBuckets.find((b) => isPriceBucketSelected(b));

  const activeFilters = useMemo(() => {
    const items: Array<{ key: string; label: string; onRemove: () => void }> = [];

    for (const id of quickFilters) {
      items.push({
        key: `quick-${id}`,
        label: QUICK_FILTER_LABELS[id],
        onRemove: () => onToggleQuickFilter(id),
      });
    }

    if (categorySlug) {
      const category = categoryOptions.find((c) => c.slug === categorySlug);
      items.push({
        key: `category-${categorySlug}`,
        label: category?.name ?? categorySlug,
        onRemove: () => onCategorySelect(categorySlug),
      });
    }

    if (selectedPriceBucket) {
      items.push({
        key: `price-${selectedPriceBucket.id}`,
        label: selectedPriceBucket.label,
        onRemove: () => onPriceBucketSelect(selectedPriceBucket),
      });
    }

    if (brandSlug) {
      const brand = brandOptions.find((b) => b.slug === brandSlug);
      items.push({
        key: `brand-${brandSlug}`,
        label: brand?.name ?? brandSlug,
        onRemove: () => onBrandSelect(brandSlug),
      });
    }

    if (searchQuery.trim() && onClearSearch) {
      items.push({
        key: "search-query",
        label: `"${searchQuery.trim()}"`,
        onRemove: onClearSearch,
      });
    }

    return items;
  }, [
    quickFilters,
    categorySlug,
    categoryOptions,
    selectedPriceBucket,
    brandSlug,
    brandOptions,
    searchQuery,
    onClearSearch,
    onToggleQuickFilter,
    onCategorySelect,
    onPriceBucketSelect,
    onBrandSelect,
  ]);

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className={cn("space-y-8", className)}>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          hasActiveFilters ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!hasActiveFilters}
      >
        <div className="min-h-0 overflow-hidden">
          <section
            className={cn(
              "border-b border-black/10 pb-6 transition-[border-color,padding-bottom] duration-300 ease-out",
              !hasActiveFilters && "pointer-events-none border-transparent pb-0",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between gap-2 transition-opacity duration-300 ease-out",
                hasActiveFilters ? "opacity-100" : "opacity-0",
              )}
            >
              <h3 className="font-store-body text-sm font-medium text-[var(--store-ink)]">Active Filters</h3>
              <button
                type="button"
                onClick={onClearFilters}
                tabIndex={hasActiveFilters ? 0 : -1}
                className="shrink-0 font-store-body text-xs font-medium text-[var(--store-muted)] underline-offset-2 hover:text-[var(--store-ink)] hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <ActiveFilterChip
                  key={filter.key}
                  label={filter.label}
                  onRemove={filter.onRemove}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <section>
        <h3 className={storeFieldLabelClass}>Highlights</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {OTHER_FILTERS.map((f) => (
            <FilterChip
              key={f.id}
              active={quickFilters.includes(f.id)}
              onClick={() => onToggleQuickFilter(f.id)}
              icon={f.Icon}
            >
              {f.label}
            </FilterChip>
          ))}
        </div>
      </section>

      {categoryOptions.length > 0 && (
        <section>
          <h3 className={storeFieldLabelClass}>Categories</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {categoryOptions.map((c) => (
              <FilterChip
                key={c.id}
                active={categorySlug === c.slug}
                onClick={() => onCategorySelect(c.slug)}
              >
                {c.name}
              </FilterChip>
            ))}
          </div>
        </section>
      )}

      {priceBuckets.length > 0 && (
        <section>
          <h3 className={storeFieldLabelClass}>Price Range</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {priceBuckets.map((bucket) => (
              <FilterChip
                key={bucket.id}
                active={isPriceBucketSelected(bucket)}
                onClick={() => onPriceBucketSelect(bucket)}
              >
                {bucket.label}
              </FilterChip>
            ))}
          </div>
        </section>
      )}

      {brandOptions.length > 0 && (
        <section>
          <h3 className={storeFieldLabelClass}>Brands</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {brandOptions.map((b) => (
              <FilterChip
                key={b.id}
                active={brandSlug === b.slug}
                onClick={() => onBrandSelect(b.slug)}
              >
                {b.name}
              </FilterChip>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
