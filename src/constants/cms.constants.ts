import type { CmsCategorySlot } from "@/types/cms.types";

/** Hero slider image specs — matches storefront `HomeHeroBanner` frame (object-cover). */
export const SLIDER_IMAGE_SPECS = {
  desktop: {
    label: "Desktop",
    width: 1600,
    height: 1280,
    ratio: "5:4",
    hint: "1600×1280 px (5:4) — shown at ≥1024px width",
  },
  mobile: {
    label: "Mobile",
    width: 1200,
    height: 900,
    ratio: "4:3",
    hint: "1200×900 px (4:3) — shown below 1024px width",
  },
} as const;

export const HOME_IMAGE_SPECS = {
  portrait: {
    label: "Portrait tile",
    width: 900,
    height: 1200,
    ratio: "3:4",
    hint: "900×1200 px (3:4) — category tiles",
  },
  banner: {
    label: "Banner",
    width: 1600,
    height: 1100,
    ratio: "16:11",
    hint: "1600×1100 px (16:11) — promo banner",
  },
  landscape: {
    label: "Landscape",
    width: 1600,
    height: 1200,
    ratio: "4:3",
    hint: "1600×1200 px (4:3) — brand story",
  },
  mobile: {
    label: "Mobile override",
    width: 900,
    height: 1200,
    ratio: "3:4",
    hint: "900×1200 px (3:4). Uses desktop if empty.",
  },
} as const;

export const CMS_HOME_IMAGE_SECTIONS = [
  {
    key: "category-archive" as const,
    label: "Shop by Category",
    description: "Category grid tiles on the homepage.",
    aspectRatio: 3 / 4,
  },
  {
    key: "promo-banners" as const,
    label: "Promo Banners",
    description: "Free delivery and brand promise banner tiles on the homepage.",
    aspectRatio: 16 / 11,
  },
  {
    key: "brand-intro" as const,
    label: "The Faithful Meat Promise",
    description: "Brand story image on the homepage.",
    aspectRatio: 4 / 3,
  },
] as const;

export const CMS_CATEGORY_SLOTS: CmsCategorySlot[] = [
  { key: "chicken", label: "Chicken", group: "categories", imageKey: "chicken" },
  { key: "mutton", label: "Mutton", group: "categories", imageKey: "mutton" },
  { key: "fish", label: "Fish", group: "categories", imageKey: "fish" },
  { key: "seafood", label: "Seafood", group: "categories", imageKey: "seafood" },
  { key: "ready-to-cook", label: "Ready to Cook", group: "categories", imageKey: "ready-to-cook" },
  { key: "eggs", label: "Eggs", group: "categories", imageKey: "eggs" },
];
