import type { HeroSlide, Slider, SliderApiRow } from "@/types/cms.types";

export const parseSliderRow = (row: SliderApiRow): Slider => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle ?? "",
  imageUrl: row.imageUrl ?? null,
  imageUrlMobile: row.imageUrlMobile ?? null,
  linkUrl: row.linkUrl ?? "/collection",
  linkLabel: row.linkLabel ?? "Discover Collection",
  sortOrder: row.sortOrder ?? 0,
  isActive: row.isActive ?? true,
  startDate: row.startDate ?? null,
  endDate: row.endDate ?? null,
});

export const toHeroSlides = (sliders: Slider[]): HeroSlide[] =>
  sliders.map((slider) => ({
    id: slider.id,
    title: slider.title,
    subtitle: slider.subtitle,
    imageUrl: slider.imageUrl ?? slider.imageUrlMobile ?? "",
    imageUrlMobile: slider.imageUrlMobile,
    linkUrl: slider.linkUrl || "/collection",
    linkLabel: slider.linkLabel || "Discover Collection",
  }));

export const resolveSlideImageUrl = (slide: HeroSlide, isMobile: boolean): string => {
  if (isMobile && slide.imageUrlMobile) return slide.imageUrlMobile;
  return slide.imageUrl;
};
