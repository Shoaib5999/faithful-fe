import type { Banner, BannerImage } from "@/types/cms.types";

export const storageKeyFromUrl = (url: string): string => {
  try {
    const pathname = new URL(url).pathname.replace(/^\//, "");
    return decodeURIComponent(pathname);
  } catch {
    return url;
  }
};

export const mergeBannerImages = (
  ...lists: Array<BannerImage[] | undefined>
): BannerImage[] => {
  const seen = new Set<string>();
  const merged: BannerImage[] = [];

  for (const list of lists) {
    for (const img of list ?? []) {
      if (!img.url || seen.has(img.storageKey)) continue;
      seen.add(img.storageKey);
      merged.push(img);
    }
  }

  return merged;
};

export const normalizeBanner = (banner: Banner): Banner => {
  const fromLegacy =
    banner.images?.length
      ? banner.images
      : banner.imageUrl
        ? [{ url: banner.imageUrl, storageKey: storageKeyFromUrl(banner.imageUrl) }]
        : [];

  const images = mergeBannerImages(fromLegacy);

  return {
    ...banner,
    images,
    imageUrl: images[0]?.url ?? null,
  };
};

export const bannerPayloadFromImages = (
  images: BannerImage[],
  base: Omit<Banner, "id" | "images" | "imageUrl">,
): Omit<Banner, "id"> => ({
  ...base,
  images,
  imageUrl: images[0]?.url ?? null,
});

export const isBannerScheduleActive = (banner: Banner, at = new Date()): boolean => {
  if (!banner.isActive) return false;
  const start = banner.startDate ? new Date(banner.startDate) : null;
  const end = banner.endDate ? new Date(banner.endDate) : null;
  if (start && at < start) return false;
  if (end && at > end) return false;
  return true;
};
