/** Public R2 bucket (faithfulmeat) — set in .env as VITE_R2_PUBLIC_URL */
const R2_PUBLIC_BASE =
  import.meta.env.VITE_R2_PUBLIC_URL ??
  "https://pub-6f21b70a3ca94b238b4d50bc577737f9.r2.dev";

const categoryPath = (filename: string) =>
  `${R2_PUBLIC_BASE}/categories/${encodeURIComponent(filename)}`;

const sliderPath = (filename: string) =>
  `${R2_PUBLIC_BASE}/sliders/${encodeURIComponent(filename)}`;

/**
 * R2 keys under `categories/` — mapped to storefront category tiles.
 * TODO: upload real category photography via the admin media library; these
 * filenames are placeholders and will 404 until real images are uploaded.
 */
export const CATEGORY_R2_IMAGES: Record<string, string> = {
  // categories/chicken.jpg was never uploaded (404s) — borrowing the
  // "Whole Chicken (Skinless)" product photo until a dedicated category
  // shot is uploaded to R2.
  chicken: `${R2_PUBLIC_BASE}/products/1785692856489-5e857556-IMG_20260802_231642.jpg`,
  mutton: categoryPath("mutton.jpg"),
  fish: categoryPath("fish.jpg"),
  seafood: categoryPath("seafood.jpg"),
  "ready-to-cook": categoryPath("ready-to-cook.jpg"),
  eggs: categoryPath("eggs.jpg"),
};

/** TODO: upload real hero slider photography via the admin CMS sliders panel. */
export const SLIDERS_R2_IMAGES: Record<string, string> = {
  slider1: sliderPath("slider-1.jpg"),
  slider2: sliderPath("slider-2.jpg"),
  slider3: sliderPath("slider-3.jpg"),
};

export const HERO_SLIDER_IMAGES = [
  SLIDERS_R2_IMAGES.slider1,
  SLIDERS_R2_IMAGES.slider2,
  SLIDERS_R2_IMAGES.slider3,
] as const;

export const HERO_CTA = {
  label: "Shop now",
  to: "/collection",
} as const;
