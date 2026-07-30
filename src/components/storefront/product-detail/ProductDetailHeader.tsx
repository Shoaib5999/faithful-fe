import { Share2, Star } from "lucide-react";
import { RevealTitle } from "@/components/storefront/motion/RevealTitle";
import { getProductHighlightBadges } from "@/constants/product-detail.constants";
import type { StoreProductDetail } from "@/lib/store-product-detail";
import type { ProductDetailVariant } from "@/lib/store-product-detail";

type ProductDetailHeaderProps = {
  product: StoreProductDetail;
  variant: ProductDetailVariant;
  onShare: () => void;
};

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <Star className="h-4 w-4 fill-[#f5c518] text-[#f5c518]" strokeWidth={0} />
      <span className="font-store-body text-sm text-[var(--store-ink)]">
        <span className="font-semibold">{rating.toFixed(2)}</span>
        <span className="text-[var(--store-muted)]">
          {" "}
          (
          <button type="button" className="underline decoration-[var(--store-ink)]/40 underline-offset-2">
            {reviewCount} Reviews
          </button>
          )
        </span>
      </span>
    </div>
  );
}

export function ProductDetailHeader({ product, variant, onShare }: ProductDetailHeaderProps) {
  const highlightBadges = getProductHighlightBadges(product.freshnessTags, product.extraTags);

  return (
    <header>
      {highlightBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {highlightBadges.map((badge) => (
            <span
              key={badge.id}
              className="rounded-full border border-[var(--store-red)]/20 bg-[var(--store-cream)] px-3 py-1 font-store-body text-[11px] font-medium text-[var(--store-ink)]"
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      <div className={`flex items-start justify-between gap-3 ${highlightBadges.length > 0 ? "mt-3" : ""}`}>
        <div className="min-w-0 flex-1">
          <RevealTitle
            as="h1"
            className=" text-xl font-bold leading-tight text-[var(--store-ink)] md:text-2xl lg:text-[1.65rem]"
          >
            {product.name} — {variant.label}
          </RevealTitle>
          {product.cutInfo && (
            <p className="mt-1 font-store-body text-xs font-medium text-[var(--store-red)] md:text-sm">
              {product.cutInfo}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onShare}
          className="shrink-0 rounded-full p-2 text-[var(--store-ink)] transition-colors hover:bg-[var(--store-cream)]"
          aria-label="Share product"
        >
          <Share2 className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-2.5">
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
      </div>
    </header>
  );
}
