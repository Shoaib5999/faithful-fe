const WISHLIST_STORAGE_KEY = "faithfulmeat:wishlist:v1";

export const readLocalWishlistIds = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
};

export const writeLocalWishlistIds = (ids: string[]): void => {
  if (typeof window === "undefined") return;
  const unique = [...new Set(ids)];
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(unique));
};

export const isInLocalWishlist = (productId: string): boolean =>
  readLocalWishlistIds().includes(productId);

/** Toggle product in local wishlist; returns new wishlisted state. */
export const toggleLocalWishlist = (productId: string): boolean => {
  const ids = readLocalWishlistIds();
  const exists = ids.includes(productId);
  const next = exists ? ids.filter((id) => id !== productId) : [...ids, productId];
  writeLocalWishlistIds(next);
  return !exists;
};

export const clearLocalWishlist = (): void => writeLocalWishlistIds([]);

export const WISHLIST_CHANGED_EVENT = "faithfulmeat:wishlist-changed";

export const dispatchWishlistChanged = (): void => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(WISHLIST_CHANGED_EVENT));
};
