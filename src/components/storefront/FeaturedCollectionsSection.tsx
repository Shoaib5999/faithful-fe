import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CATEGORY_R2_IMAGES } from "@/constants/category-media.constants";
import { FEATURED_COLLECTIONS } from "@/constants/storefront.constants";
import { useStorefrontHomeImages } from "@/hooks/useStorefrontHomeImages";
import { resolveHomeImageUrl } from "@/lib/home-image-utils";
import { RevealText } from "@/components/storefront/motion/RevealText";
import { RevealWordTitle } from "@/components/storefront/motion/RevealWordTitle";
import { useGsapClipReveal } from "@/components/storefront/motion/useGsapClipReveal";
import { StoreHomeSection, type StoreSectionTheme } from "@/components/storefront/StoreHomeSection";
import type { HomeImageMap } from "@/types/cms.types";
import { cn } from "@/lib/utils";

const COLLECTION_COPY: Record<string, string> = {
  chicken: "Farm fresh",
  mutton: "Tender cuts",
  seafood: "Off the boat",
};

function CollectionCard({
  collection,
  homeImages,
}: {
  collection: (typeof FEATURED_COLLECTIONS)[number];
  homeImages: HomeImageMap;
}) {
  const clipRef = useRef<HTMLDivElement>(null);
  useGsapClipReveal(clipRef, clipRef);

  const cmsItem = homeImages[collection.id];
  const imageSrc = resolveHomeImageUrl(
    collection.id,
    homeImages,
    CATEGORY_R2_IMAGES[collection.imageKey],
  );
  const subtitle = cmsItem?.subtitle || COLLECTION_COPY[collection.id];
  const linkTo = cmsItem?.linkUrl || collection.to;
  const label = cmsItem?.title || collection.label;

  return (
    <li className="min-w-0">
      <Link
        to={linkTo}
        className={cn(
          "group relative block overflow-hidden rounded-sm",
          "aspect-[3/4] sm:aspect-[4/5] md:aspect-[5/6] lg:aspect-[3/4] lg:min-h-[360px]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-red)]",
        )}
      >
        <div
          ref={clipRef}
          className="absolute inset-0 overflow-hidden bg-[var(--store-cream)]"
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={label}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] group-active:scale-[1.02]"
              loading="lazy"
              draggable={false}
            />
          )}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-[var(--store-red-dark)]/60 via-[var(--store-red)]/15 to-transparent",
              "transition-colors duration-500 group-hover:from-[var(--store-red-dark)]/50",
            )}
          />
        </div>

        <span
          className={cn(
            "pointer-events-none absolute right-2 top-2 z-[1] flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-500 sm:right-3 sm:top-3 sm:h-8 sm:w-8",
            "opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0",
            "group-focus-visible:opacity-100 group-focus-visible:translate-y-0",
          )}
          aria-hidden
        >
          <ArrowUpRight className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" strokeWidth={1.5} />
        </span>

        <div className="absolute inset-x-0 bottom-0 z-[1] p-2.5 sm:p-3 md:p-4 lg:p-5">
          <span className="font-store-body text-xs uppercase tracking-[0.28em] text-[var(--store-red)] sm:tracking-[0.32em]">
            {subtitle}
          </span>
          <h3 className="mt-0.5 font-display text-[clamp(0.85rem,2.4vw,1.75rem)] font-normal leading-tight tracking-wide text-white sm:mt-1">
            {label}
          </h3>
        </div>
      </Link>
    </li>
  );
}

type FeaturedCollectionsSectionProps = {
  theme?: StoreSectionTheme;
};

export function FeaturedCollectionsSection({ theme = "light" }: FeaturedCollectionsSectionProps) {
  const { data: homeImages = {} } = useStorefrontHomeImages();

  return (
    <StoreHomeSection theme={theme} aria-labelledby="featured-collections-heading">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-12 xl:px-16">
        <header className="mb-6 sm:mb-8 md:mb-12">
          <RevealText
            variant="eyebrow"
            className="font-store-body text-xs uppercase tracking-[0.32em] text-[var(--store-red-dark)]"
          >
            Shop by
          </RevealText>
          <RevealWordTitle
            as="h2"
            id="featured-collections-heading"
            className="mt-2 font-display text-[clamp(1.75rem,4vw,3.25rem)] font-normal leading-[1.06] tracking-wide text-[var(--section-fg)]"
          >
            Customer favorites
          </RevealWordTitle>
        </header>

        <ul className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {FEATURED_COLLECTIONS.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} homeImages={homeImages} />
          ))}
        </ul>
      </div>
    </StoreHomeSection>
  );
}
