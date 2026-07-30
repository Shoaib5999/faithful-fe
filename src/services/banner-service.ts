import type { Banner, BannerImage, BannerPosition } from "@/types/cms.types";
import { generateId } from "@/lib/formatters";
import {
  bannerPayloadFromImages,
  isBannerScheduleActive,
  normalizeBanner,
} from "@/lib/banner-utils";

const BANNERS_STORAGE_KEY = "faithfulmeat.cms.banners";

let banners: Banner[] = loadFromStorage();

function loadFromStorage(): Banner[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BANNERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Banner[];
    return parsed.map(normalizeBanner);
  } catch {
    return [];
  }
}

const BANNERS_UPDATED_EVENT = "faithfulmeat:banners-updated";

function persist(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
  window.dispatchEvent(new CustomEvent(BANNERS_UPDATED_EVENT));
}

export const subscribeBannerUpdates = (listener: () => void): (() => void) => {
  if (typeof window === "undefined") return () => undefined;

  const onCustom = () => listener();
  const onStorage = (e: StorageEvent) => {
    if (e.key === BANNERS_STORAGE_KEY) listener();
  };

  window.addEventListener(BANNERS_UPDATED_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(BANNERS_UPDATED_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
};

export const fetchBanners = (): Promise<Banner[]> =>
  Promise.resolve(banners.map(normalizeBanner));

export const createBanner = (input: Omit<Banner, "id">): Promise<Banner> => {
  const banner = normalizeBanner({ ...input, id: generateId() });
  banners.push(banner);
  persist();
  return Promise.resolve(banner);
};

export const updateBanner = (
  id: string,
  input: Partial<Omit<Banner, "id">>,
): Promise<Banner> => {
  const idx = banners.findIndex((b) => b.id === id);
  if (idx === -1) return Promise.reject(new Error("Not found"));

  const next = normalizeBanner({ ...banners[idx], ...input });
  banners[idx] = next;
  persist();
  return Promise.resolve(next);
};

export const deleteBanner = (id: string): Promise<void> => {
  banners = banners.filter((b) => b.id !== id);
  persist();
  return Promise.resolve();
};

export const getAllBanners = (): Banner[] => banners.map(normalizeBanner);
export const getBannerArray = (): Banner[] => banners;

export const getActiveBannersByPosition = (
  position: BannerPosition,
): Banner[] =>
  banners
    .map(normalizeBanner)
    .filter((b) => b.position === position && isBannerScheduleActive(b));

export const getStorefrontBannerSlides = (
  position: BannerPosition,
): Array<{ imageUrl: string; linkUrl: string; alt: string }> => {
  const slides: Array<{ imageUrl: string; linkUrl: string; alt: string }> = [];
  const seenUrls = new Set<string>();

  for (const banner of getActiveBannersByPosition(position)) {
    for (const img of banner.images) {
      if (!img.url || seenUrls.has(img.url)) continue;
      seenUrls.add(img.url);
      slides.push({
        imageUrl: img.url,
        linkUrl: banner.linkUrl || "/collection",
        alt: banner.name,
      });
    }
  }

  return slides;
};

export const syncBannerImages = (
  id: string,
  images: BannerImage[],
  partial?: Partial<Omit<Banner, "id" | "images" | "imageUrl">>,
): Promise<Banner> => {
  const idx = banners.findIndex((b) => b.id === id);
  if (idx === -1) return Promise.reject(new Error("Not found"));

  const payload = bannerPayloadFromImages(images, {
    ...banners[idx],
    ...partial,
  });

  return updateBanner(id, payload);
};
