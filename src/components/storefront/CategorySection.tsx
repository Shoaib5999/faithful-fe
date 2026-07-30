import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SHOP_CATEGORIES } from "@/constants/storefront.constants";
import { CATEGORY_R2_IMAGES } from "@/constants/category-media.constants";
import { useStorefrontHomeImages } from "@/hooks/useStorefrontHomeImages";
import { resolveHomeImageUrl } from "@/lib/home-image-utils";
import { RevealText } from "@/components/storefront/motion/RevealText";
import { RevealWordTitle } from "@/components/storefront/motion/RevealWordTitle";
import { useGsapClipReveal } from "@/components/storefront/motion/useGsapClipReveal";
import { StoreHomeSection, type StoreSectionTheme } from "@/components/storefront/StoreHomeSection";
import type { HomeImageMap } from "@/types/cms.types";
import { cn } from "@/lib/utils";

const CATEGORIES = SHOP_CATEGORIES.slice(0, 4);

const ROMAN_INDEX = ["I", "II", "III", "IV"] as const;

type CategorySectionProps = {
  theme?: StoreSectionTheme;
};

export function CategorySection({ theme = "light" }: CategorySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { data: homeImages = {} } = useStorefrontHomeImages();

  return (
    <StoreHomeSection
      ref={sectionRef}
      theme={theme}
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-12 xl:px-16">
        <header className="mb-8 sm:mb-10 md:mb-14">
          <RevealText variant="eyebrow" className="font-store-body text-xs uppercase tracking-[0.32em] text-[var(--store-red)]">
            Explore
          </RevealText>
          <RevealWordTitle
            as="h2"
            id="categories-heading"
            className="mt-2 font-display text-[clamp(1.75rem,4vw,3.25rem)] font-normal leading-[1.06] tracking-wide text-[var(--section-fg)]"
          >
            The Archive
          </RevealWordTitle>
        </header>

        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
          {CATEGORIES.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              homeImages={homeImages}
            />
          ))}
        </ul>
      </div>
    </StoreHomeSection>
  );
}

function CategoryCard({
  category,
  index,
  homeImages,
}: {
  category: (typeof CATEGORIES)[number];
  index: number;
  homeImages: HomeImageMap;
}) {
  const clipRef = useRef<HTMLDivElement>(null);
  useGsapClipReveal(clipRef, clipRef);

  const cmsItem = homeImages[category.id];
  const imageSrc = resolveHomeImageUrl(
    category.id,
    homeImages,
    CATEGORY_R2_IMAGES[category.imageKey],
  );
  const linkTo = cmsItem?.linkUrl || category.to;
  const label = cmsItem?.title || category.label;
  const isAccentTile = index % 2 === 1;

  return (
    <li className="min-w-0">
      <Link
        to={linkTo}
        className={cn(
          "group relative block h-full overflow-hidden",
          "aspect-[3/4] sm:aspect-[4/5] md:aspect-auto md:min-h-[260px] lg:min-h-[320px] xl:min-h-[380px]",
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
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] group-active:scale-[1.03]"
              loading="lazy"
              draggable={false}
            />
          )}
          <div
            className={cn(
              "absolute inset-0 transition-colors duration-500",
              "bg-gradient-to-t from-[var(--store-red-dark)]/65 via-[var(--store-red)]/20 to-[var(--store-red)]/5",
              "group-hover:from-[var(--store-red-dark)]/55 group-hover:via-[var(--store-red)]/15 group-hover:to-transparent",
            )}
          />
        </div>

        <span
          className={cn(
            "pointer-events-none absolute left-3 top-3 z-[1] font-display text-[clamp(1.25rem,3vw,1.75rem)] leading-none tracking-wide text-white/30 transition-colors duration-500 sm:left-4 sm:top-4",
            "group-hover:text-[var(--store-red)]/70",
          )}
          aria-hidden
        >
          {ROMAN_INDEX[index]}
        </span>

        <span
          className={cn(
            "pointer-events-none absolute right-3 top-3 z-[1] flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm transition-all duration-500 sm:right-4 sm:top-4 sm:h-9 sm:w-9",
            "opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0",
            "group-focus-visible:opacity-100 group-focus-visible:translate-y-0",
            "md:opacity-0 md:group-hover:opacity-100",
          )}
          aria-hidden
        >
          <ArrowUpRight className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" strokeWidth={1.5} />
        </span>

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-[1] p-3 sm:p-4 md:p-5 lg:p-6",
            isAccentTile && "md:pb-7",
          )}
        >
          <span className="font-store-body text-[8px] uppercase tracking-[0.38em] text-[var(--store-red)] sm:text-[9px] sm:tracking-[0.42em]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-1 font-display text-[clamp(0.95rem,2.8vw,1.75rem)] font-normal leading-tight tracking-wide text-white">
            {label}
          </h3>
          <p
            className={cn(
              "mt-1.5 font-store-body text-[11px] leading-snug text-white/75 sm:text-xs sm:leading-relaxed md:mt-2 md:text-[13px]",
              "line-clamp-2 md:max-h-0 md:opacity-0 md:transition-all md:duration-500 md:ease-out",
              "md:group-hover:max-h-16 md:group-hover:opacity-100",
              "md:group-focus-visible:max-h-16 md:group-focus-visible:opacity-100",
            )}
          >
            {category.description}
          </p>
        </div>

        <span
          className={cn(
            "pointer-events-none absolute inset-3 rounded-sm border border-white/0 transition-colors duration-500 sm:inset-4",
            "group-hover:border-white/20 group-focus-visible:border-white/20",
          )}
          aria-hidden
        />
      </Link>
    </li>
  );
}
