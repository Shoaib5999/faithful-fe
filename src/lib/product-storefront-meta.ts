import type { ProductStorefrontMeta } from "@/types/product-storefront-meta";

export const DEFAULT_STOREFRONT_CONTENT: Pick<
  ProductStorefrontMeta,
  "storageInstructions" | "cookingTips"
> = {
  storageInstructions:
    "Keep refrigerated at or below 4°C. Use within 24 hours of delivery, or freeze immediately for longer storage.",
  cookingTips:
    "Cook thoroughly to an internal temperature of at least 75°C. Thaw fully before cooking if frozen.",
};

export const EMPTY_STOREFRONT_META: ProductStorefrontMeta = {
  origin: "",
  cutInfo: "",
  storageInstructions: "",
  cookingTips: "",
  freshnessTags: [],
};

export const DEFAULT_NEW_PRODUCT_STOREFRONT_META: ProductStorefrontMeta = {
  ...EMPTY_STOREFRONT_META,
  ...DEFAULT_STOREFRONT_CONTENT,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
};

export const parseStorefrontMeta = (raw: unknown): ProductStorefrontMeta => {
  if (!isRecord(raw)) {
    return { ...EMPTY_STOREFRONT_META };
  }

  return {
    origin: String(raw.origin ?? "").trim(),
    cutInfo: String(raw.cutInfo ?? "").trim(),
    storageInstructions: String(raw.storageInstructions ?? "").trim(),
    cookingTips: String(raw.cookingTips ?? "").trim(),
    freshnessTags: toStringArray(raw.freshnessTags),
  };
};

export const buildStorefrontMeta = (
  meta: ProductStorefrontMeta,
  cutTypes: string[],
): ProductStorefrontMeta => {
  const clean = (items: string[]) => items.map((s) => s.trim()).filter(Boolean);
  const defaultCutInfo = cutTypes.map((type) => type.trim()).filter(Boolean).join(" · ");

  return {
    origin: meta.origin?.trim() ?? "",
    cutInfo: meta.cutInfo?.trim() || defaultCutInfo,
    storageInstructions: meta.storageInstructions?.trim() ?? "",
    cookingTips: meta.cookingTips?.trim() ?? "",
    freshnessTags: clean(meta.freshnessTags ?? []),
  };
};
