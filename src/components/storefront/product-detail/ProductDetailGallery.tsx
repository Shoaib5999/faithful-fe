import { useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import { Heart, Loader2 } from "lucide-react";
import { isProductPlaceholderImage } from "@/constants/product-image.constants";
import { useWishlist } from "@/hooks/useWishlist";
import { formatProductBadgeLabel } from "@/lib/product-api";
import { cn } from "@/lib/utils";
import type { StoreProductDetail } from "@/lib/store-product-detail";

type ProductDetailGalleryProps = {
  product: StoreProductDetail;
  gallery: string[];
  galleryIdx: number;
  onSelect: (idx: number) => void;
};

const MOBILE_CAROUSEL_OPTIONS: EmblaOptionsType = {
  align: "start",
  loop: false,
  dragFree: false,
  containScroll: "trimSnaps",
  duration: 28,
};

const DESKTOP_CAROUSEL_OPTIONS: EmblaOptionsType = {
  align: "start",
  loop: false,
  dragFree: false,
  containScroll: "trimSnaps",
  duration: 28,
};

function useGalleryCarousel(
  galleryIdx: number,
  onSelect: (idx: number) => void,
  options: EmblaOptionsType,
) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const onEmblaSelect = useCallback(() => {
    if (!emblaApi) return;
    onSelect(emblaApi.selectedScrollSnap());
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onEmblaSelect);
    onEmblaSelect();
    return () => {
      emblaApi.off("select", onEmblaSelect);
    };
  }, [emblaApi, onEmblaSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    if (emblaApi.selectedScrollSnap() !== galleryIdx) {
      emblaApi.scrollTo(galleryIdx, true);
    }
  }, [emblaApi, galleryIdx]);

  return { emblaRef, emblaApi };
}

type GallerySlidesProps = {
  gallery: string[];
  productName: string;
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
  className?: string;
};

function GallerySlides({
  gallery,
  productName,
  emblaRef,
  className,
}: GallerySlidesProps) {
  return (
    <div ref={emblaRef} className={cn("h-full w-full max-w-full overflow-hidden", className)}>
      <div className="flex h-full min-h-0 touch-pan-y">
        {gallery.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative h-full min-h-0 min-w-0 flex-[0_0_100%] overflow-hidden bg-[var(--store-cream)]"
          >
            <img
              src={src}
              alt={`${productName} — view ${i + 1}`}
              className={cn(
                "h-full w-full object-center",
                isProductPlaceholderImage(src)
                  ? "object-contain p-10"
                  : "object-cover",
              )}
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type GalleryThumbnailStripProps = {
  gallery: string[];
  galleryIdx: number;
  onSelect: (idx: number) => void;
  orientation?: "horizontal" | "vertical";
};

function GalleryThumbnailStrip({
  gallery,
  galleryIdx,
  onSelect,
  orientation = "horizontal",
}: GalleryThumbnailStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isVertical = orientation === "vertical";

  useEffect(() => {
    if (isVertical) return;
    const container = scrollRef.current;
    const thumb = container?.querySelector<HTMLElement>(`[data-thumb-idx="${galleryIdx}"]`);
    if (!container || !thumb) return;

    const targetLeft =
      thumb.offsetLeft - container.clientWidth / 2 + thumb.offsetWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "smooth",
    });
  }, [galleryIdx, isVertical]);

  if (gallery.length === 0) return null;

  const DESKTOP_THUMB_SIZE =
    "h-[4.25rem] w-[4.25rem] shrink-0 lg:h-[4.75rem] lg:w-[4.75rem]";

  const thumbButtonClass = (selected: boolean) =>
    cn(
      "relative box-border overflow-hidden rounded-lg border bg-[var(--store-cream)] transition-[border-color,box-shadow,opacity]",
      isVertical ? DESKTOP_THUMB_SIZE : "h-16 w-16 shrink-0 sm:h-[4.5rem] sm:w-[4.5rem]",
      selected
        ? "border-[var(--store-red)] shadow-[var(--store-shadow-sm)]"
        : "border-black/10 hover:border-[var(--store-red)]/50",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-red)]",
    );

  const strip = (
    <div
      ref={scrollRef}
      className={cn(
        isVertical
          ? "flex flex-col items-start gap-2.5"
          : cn(
              "flex gap-3 overflow-x-auto pb-1.5 sm:gap-3.5",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            ),
      )}
      role="tablist"
      aria-label="Product photos"
    >
      {gallery.map((src, i) => (
        <button
          key={`${src}-${i}`}
          type="button"
          data-thumb-idx={i}
          role="tab"
          aria-selected={galleryIdx === i}
          aria-label={`View image ${i + 1} of ${gallery.length}`}
          onClick={() => onSelect(i)}
          className={thumbButtonClass(galleryIdx === i)}
        >
          <img
            src={src}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-center",
              isProductPlaceholderImage(src) ? "object-contain p-2" : "object-cover",
            )}
            draggable={false}
          />
        </button>
      ))}
    </div>
  );

  if (isVertical) {
    return (
      <div className="shrink-0 self-start pt-0">
        <p className="sr-only">
          {gallery.length > 1
            ? "Select a thumbnail to change the main product image"
            : "Product image"}
        </p>
        {strip}
      </div>
    );
  }

  return (
    <div className="mt-4 max-w-full overflow-hidden border-t border-black/10 pt-4 md:hidden">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-store-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--store-muted)]">
          {gallery.length > 1 ? "All photos" : "Photo"}
        </p>
        {gallery.length > 1 && (
          <span className="font-store-body text-[10px] text-[var(--store-muted)]/70">
            {galleryIdx + 1} / {gallery.length}
          </span>
        )}
      </div>
      <p className="sr-only">
        {gallery.length > 1
          ? "Select a thumbnail to change the main product image"
          : "Product image"}
      </p>
      {strip}
    </div>
  );
}

export function ProductDetailGallery({
  product,
  gallery,
  galleryIdx,
  onSelect,
}: ProductDetailGalleryProps) {
  const mobileCarousel = useGalleryCarousel(galleryIdx, onSelect, MOBILE_CAROUSEL_OPTIONS);
  const desktopCarousel = useGalleryCarousel(galleryIdx, onSelect, DESKTOP_CAROUSEL_OPTIONS);
  const { wishlistedById, wishlistUpdatingId, handleToggleWishlist } = useWishlist();
  const wishlisted = Boolean(wishlistedById[product.id]);
  const isWishlistUpdating = wishlistUpdatingId === product.id;

  const mainStageClass =
    "relative w-full overflow-hidden rounded-lg border border-black/10 bg-[var(--store-cream)] aspect-square max-h-[min(68vh,520px)]";

  const wishlistButton = (
    <div className="absolute right-3 top-3 z-10">
      <button
        type="button"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        disabled={isWishlistUpdating}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void handleToggleWishlist(product.id);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[var(--store-ink)]/55 backdrop-blur-sm transition-all hover:bg-white hover:text-[var(--store-ink)] disabled:opacity-50"
      >
        {isWishlistUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart
            strokeWidth={1.5}
            className={cn(
              "h-[15px] w-[15px] transition-colors",
              wishlisted ? "fill-red-500 text-red-500" : "fill-none",
            )}
          />
        )}
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Mobile: main + thumbnail strip */}
      <div className="max-w-full overflow-hidden md:hidden">
        {product.badge && (
          <span className="mb-2 inline-block rounded-sm bg-[var(--store-ink)] px-2 py-0.5 font-store-body text-[10px] font-semibold uppercase tracking-wider text-white">
            {formatProductBadgeLabel(product.badge)}
          </span>
        )}
        <div className="mx-auto w-full max-w-[420px]">
          <div className={cn(mainStageClass, "isolate")}>
            {wishlistButton}
            <GallerySlides
              gallery={gallery}
              productName={product.name}
              emblaRef={mobileCarousel.emblaRef}
              className="absolute inset-0 min-h-0"
            />
          </div>
          <GalleryThumbnailStrip
            gallery={gallery}
            galleryIdx={galleryIdx}
            onSelect={onSelect}
          />
        </div>
      </div>

      {/* Desktop / tablet: thumbnails left + main image */}
      <div className="hidden min-w-0 md:grid md:grid-cols-[auto_minmax(0,1fr)] md:items-start md:gap-3 md:pt-2 lg:gap-4 lg:pt-0 xl:gap-5">
        <GalleryThumbnailStrip
          gallery={gallery}
          galleryIdx={galleryIdx}
          onSelect={onSelect}
          orientation="vertical"
        />
        <div className={cn(mainStageClass, "min-w-0 w-full")}>
          {product.badge && (
            <span className="absolute left-3 top-3 z-10 rounded-sm bg-[var(--store-ink)] px-2 py-0.5 font-store-body text-[10px] font-semibold uppercase tracking-wider text-white">
              {formatProductBadgeLabel(product.badge)}
            </span>
          )}
          {wishlistButton}
          <GallerySlides
            gallery={gallery}
            productName={product.name}
            emblaRef={desktopCarousel.emblaRef}
            className="absolute inset-0 min-h-0"
          />
        </div>
      </div>
    </div>
  );
}
