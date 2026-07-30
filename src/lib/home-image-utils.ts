import type { HomeImage, HomeImageApiRow, HomeImageMap } from "@/types/cms.types";

export const parseHomeImageRow = (row: HomeImageApiRow): HomeImage => ({
  id: row.id,
  slotKey: row.slotKey,
  section: row.section,
  title: row.title,
  subtitle: row.subtitle,
  imageUrl: row.imageUrl,
  imageUrlMobile: row.imageUrlMobile,
  linkUrl: row.linkUrl,
  sortOrder: row.sortOrder,
  isActive: row.isActive,
});

export const toHomeImageMap = (items: HomeImage[]): HomeImageMap =>
  Object.fromEntries(items.map((item) => [item.slotKey, item]));

export const resolveHomeImageUrl = (
  slotKey: string,
  map: HomeImageMap,
  fallbackUrl?: string,
  isMobile = false,
): string | undefined => {
  const item = map[slotKey];
  if (!item || !item.isActive) return fallbackUrl;

  if (isMobile && item.imageUrlMobile) return item.imageUrlMobile;
  if (item.imageUrl) return item.imageUrl;
  if (item.imageUrlMobile) return item.imageUrlMobile;
  return fallbackUrl;
};
