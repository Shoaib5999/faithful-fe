export const SITE_URL = "https://www.faithfulmeat.in";
export const SITE_NAME = "Faithful Meat";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo-faithful-meat.png`;

export const DEFAULT_SEO_TITLE =
  "Faithful Meat — Fresh Chicken, Mutton & Fish Delivery in Daltonganj, Palamu, Jharkhand";
export const DEFAULT_SEO_DESCRIPTION =
  "Order fresh chicken, mutton, fish & seafood online in Daltonganj, Palamu, Jharkhand. 100% hygienic, hand-cut, same-day delivery. Order now on Faithful Meat!";

/** `${page title} — ${brand}`, unless the page title already carries the brand. */
export const buildSeoTitle = (title?: string): string => {
  if (!title) return DEFAULT_SEO_TITLE;
  return title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
};

export const buildCanonical = (path: string): string => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
