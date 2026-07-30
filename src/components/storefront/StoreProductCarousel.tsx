import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StoreProductCard } from "@/components/storefront/StoreProductCard";
import { StoreSkeletonGrid } from "@/components/storefront/storefront-ui";
import { useGsapCarouselEntrance } from "@/components/storefront/motion/useGsapCarouselEntrance";
import { useWishlist } from "@/hooks/useWishlist";
import type { HomeProduct } from "@/types/storefront-catalog.types";
import type { StoreSectionTheme } from "@/components/storefront/StoreHomeSection";
import { cn } from "@/lib/utils";

type StoreProductCarouselProps = {
  products: HomeProduct[];
  carouselLabel: string;
  resetKey?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  className?: string;
  variant?: "default" | "luxury";
  theme?: StoreSectionTheme;
};

export function StoreProductCarousel({
  products,
  carouselLabel,
  resetKey = "default",
  isLoading = false,
  loadingMessage = "Loading products…",
  emptyMessage = "No products to show yet.",
  className,
  variant = "default",
  theme = "light",
}: StoreProductCarouselProps) {
  const isLuxury = variant === "luxury";
  const [scrollProgress, setScrollProgress] = useState(0);
  const entranceRef = useRef<HTMLDivElement>(null);
  useGsapCarouselEntrance(entranceRef, entranceRef, { disabled: isLoading || products.length === 0 });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    duration: 28,
    skipSnaps: false,
    watchDrag: (_emblaApi, event) => {
      const target = event.target;
      if (!(target instanceof Element)) return true;
      return !target.closest("button, input, select, textarea, [role='group']");
    },
  });

  const { wishlistedById, wishlistUpdatingId, handleToggleWishlist } = useWishlist();

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll();
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
    return () => {
      emblaApi.off("scroll", onScroll);
      emblaApi.off("reInit", onScroll);
    };
  }, [emblaApi, onScroll]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0, true);
    setScrollProgress(0);
  }, [emblaApi, resetKey]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (isLoading) {
    return (
      <div className={cn("store-section-gap", className)}>
        <StoreSkeletonGrid count={4} />
        <p className="sr-only">{loadingMessage}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="store-section-gap w-full py-12 text-center font-store-body text-sm text-[var(--section-fg-muted)]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div ref={entranceRef} className={cn("group/carousel relative", className)}>
      <button
        type="button"
        onClick={scrollPrev}
        className={cn(
          "absolute top-[40%] z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border shadow-[var(--store-shadow-md)] transition-all hover:border-[var(--store-red)] hover:text-[var(--store-red)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--store-red)] lg:flex",
          theme === "dark"
            ? "border-[var(--store-red)]/30 bg-white text-[var(--store-ink)]"
            : "border-black/10 bg-white text-[var(--store-ink)]",
          isLuxury
            ? "-left-4 h-12 w-12 xl:-left-6"
            : "-left-2 h-10 w-10 opacity-0 group-hover/carousel:opacity-100",
        )}
        aria-label="Previous products"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={scrollNext}
        className={cn(
          "absolute top-[40%] z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border shadow-[var(--store-shadow-md)] transition-all hover:border-[var(--store-red)] hover:text-[var(--store-red)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--store-red)] lg:flex",
          theme === "dark"
            ? "border-[var(--store-red)]/30 bg-white text-[var(--store-ink)]"
            : "border-black/10 bg-white text-[var(--store-ink)]",
          isLuxury
            ? "-right-4 h-12 w-12 xl:-right-6"
            : "-right-2 h-10 w-10 opacity-0 group-hover/carousel:opacity-100",
        )}
        aria-label="Next products"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 sm:gap-4">
          {products.map((product) => (
            <div
              key={`${resetKey}-${product.id}`}
              className="min-w-0 shrink-0 grow-0 basis-[80%] sm:basis-[46%] lg:basis-[31%] xl:basis-[24%]"
            >
              <StoreProductCard
                product={product}
                variant={isLuxury ? "editorial" : "default"}
                wishlisted={Boolean(wishlistedById[product.id])}
                isWishlistUpdating={wishlistUpdatingId === product.id}
                onToggleWishlist={handleToggleWishlist}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "relative w-full overflow-hidden bg-[var(--section-progress-track)]",
          isLuxury ? "mt-8 h-px" : "mt-5 h-0.5 rounded-full",
        )}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${carouselLabel} scroll progress`}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 bg-[var(--store-red)] transition-[width] duration-300 ease-out",
            !isLuxury && "rounded-full",
          )}
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </div>
  );
}
