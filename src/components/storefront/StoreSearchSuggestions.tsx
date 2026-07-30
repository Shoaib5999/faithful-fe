import { Loader2 } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStorefrontSearchSuggestions } from "@/hooks/useStorefrontSearchSuggestions";
import { APP_CONFIG } from "@/constants/app.constants";
import { getCategoryDisplayLabel } from "@/constants/storefront.constants";
import { cn } from "@/lib/utils";

type StoreSearchSuggestionsProps = {
  query: string;
  visible: boolean;
  onNavigateProduct: (slug: string) => void;
  onViewAll: () => void;
  className?: string;
};

const formatInr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function StoreSearchSuggestions({
  query,
  visible,
  onNavigateProduct,
  onViewAll,
  className,
}: StoreSearchSuggestionsProps) {
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, APP_CONFIG.searchDebounceMs);
  const { data, isFetching, isLoading } = useStorefrontSearchSuggestions(query, visible);
  const products = data?.products ?? [];
  const isDebouncing = visible && trimmed.length >= 2 && trimmed !== debounced;
  const showLoading = visible && trimmed.length >= 2 && (isDebouncing || isLoading || isFetching);

  if (!visible || trimmed.length < 2) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden border border-black/10 bg-white shadow-lg",
        className,
      )}
      role="listbox"
      aria-label="Product suggestions"
    >
      {showLoading && products.length === 0 ? (
        <div className="flex items-center justify-center gap-2 px-4 py-6 font-store-body text-sm text-[#6b6b6b]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Searching…
        </div>
      ) : products.length === 0 ? (
        <div className="px-4 py-6 text-center font-store-body text-sm text-[#6b6b6b]">
          No products found for &ldquo;{trimmed}&rdquo;
        </div>
      ) : (
        <ul className="max-h-[min(60vh,320px)] overflow-y-auto py-1">
          {products.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                role="option"
                onClick={() => onNavigateProduct(product.slug)}
                className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#fafafa]"
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden border border-black/8 bg-[#fafafa]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-store-body text-sm font-semibold text-[#1a1a1a]">
                    {product.name}
                  </span>
                  <span className="mt-0.5 block truncate font-store-body text-xs text-[#6b6b6b]">
                    {[getCategoryDisplayLabel(product.categorySlug), product.brandName].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 font-store-body text-sm font-semibold text-[#1a1a1a]">
                  {formatInr(product.price)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-black/8">
        <button
          type="button"
          onClick={onViewAll}
          className="w-full cursor-pointer px-4 py-3 text-center font-store-body text-xs font-semibold uppercase tracking-[0.12em] text-[#b8954a] transition-colors hover:bg-[#fafafa] hover:text-[#1a1a1a]"
        >
          View all results for &ldquo;{trimmed}&rdquo;
        </button>
      </div>
    </div>
  );
}
