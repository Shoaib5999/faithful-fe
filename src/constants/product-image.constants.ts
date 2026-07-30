/** Neutral storefront fallback when a product has no uploaded image. */
export const PRODUCT_PLACEHOLDER_IMAGE = "/images/placeholder.png";

export const isProductPlaceholderImage = (url: string | null | undefined): boolean =>
  !url || url === PRODUCT_PLACEHOLDER_IMAGE || url.includes("placeholder.png");

export const resolveProductImage = (url: string | null | undefined): string =>
  url?.trim() ? url.trim() : PRODUCT_PLACEHOLDER_IMAGE;
