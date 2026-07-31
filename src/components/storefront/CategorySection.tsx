import { useRef } from "react";
import { Link } from "react-router-dom";
import { SHOP_CATEGORIES } from "@/constants/storefront.constants";
import { CATEGORY_R2_IMAGES } from "@/constants/category-media.constants";
import { useStorefrontHomeImages } from "@/hooks/useStorefrontHomeImages";
import { resolveHomeImageUrl } from "@/lib/home-image-utils";
import { RevealText } from "@/components/storefront/motion/RevealText";
import { RevealWordTitle } from "@/components/storefront/motion/RevealWordTitle";
import { StoreHomeSection, type StoreSectionTheme } from "@/components/storefront/StoreHomeSection";
import type { HomeImageMap } from "@/types/cms.types";

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
        <header className="mb-8 text-center sm:mb-10 md:mb-14">
          <RevealText variant="eyebrow" className="font-store-body text-xs uppercase tracking-[0.32em] text-[var(--store-red)]">
            Explore
          </RevealText>
          <RevealWordTitle
            as="h2"
            id="categories-heading"
            className="mt-2 font-display text-[clamp(1.75rem,4vw,3.25rem)] font-normal leading-[1.06] tracking-wide text-[var(--section-fg)]"
          >
            Our Categories
          </RevealWordTitle>
          <RevealText
            variant="text"
            className="mx-auto mt-3 max-w-md font-store-body text-sm leading-relaxed text-[var(--section-fg)]/60 sm:text-base"
          >
            Hand-selected cuts for every occasion, prepared with care.
          </RevealText>
        </header>

        <ul className="grid grid-cols-3 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8 md:gap-x-6">
          {SHOP_CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} homeImages={homeImages} />
          ))}
        </ul>
      </div>
    </StoreHomeSection>
  );
}

function CategoryCard({
  category,
  homeImages,
}: {
  category: (typeof SHOP_CATEGORIES)[number];
  homeImages: HomeImageMap;
}) {
  const cmsItem = homeImages[category.id];
  const imageSrc = resolveHomeImageUrl(
    category.id,
    homeImages,
    CATEGORY_R2_IMAGES[category.imageKey],
  );
  const linkTo = cmsItem?.linkUrl || category.to;
  const label = cmsItem?.title || category.label;

  return (
    <li className="min-w-0">
      <Link
        to={linkTo}
        className="group flex flex-col items-center gap-2 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--store-red)] sm:gap-3"
      >
        <span className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-[var(--store-cream)] shadow-sm ring-1 ring-black/5 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-md group-active:translate-y-0 group-active:scale-[0.98]">
          {imageSrc && (
            <img
              src={imageSrc}
              alt={label}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
              draggable={false}
            />
          )}
        </span>
        <span className="font-store-body text-xs font-medium leading-tight text-[var(--section-fg)] sm:text-sm md:text-base">
          {label}
        </span>
      </Link>
    </li>
  );
}
