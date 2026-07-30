export const getDiscountPercent = (price: number, compareAtPrice: number): number => {
  if (compareAtPrice <= price || compareAtPrice <= 0) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

export const FRESHNESS_TAG_PRESETS = [
  "Farm Fresh",
  "Antibiotic Free",
  "Hand Cut",
  "Cleaned & Ready",
  "Skinless",
  "Bone-in",
] as const;

export const HIGHLIGHT_TAG_PRESETS = [
  "Best Seller",
  "New Arrival",
  "Limited Stock",
  "Chef's Pick",
] as const;

export const PDP_TRUST_PILLARS = [
  { id: "fresh", label: "Farm fresh" },
  { id: "fast-delivery", label: "Fast delivery" },
  { id: "secure-payment", label: "Secure payment" },
] as const;

export type PdpAccordionId = "description" | "details" | "storage" | "cooking-tips";

export const PDP_ACCORDION_IDS: PdpAccordionId[] = [
  "description",
  "details",
  "storage",
  "cooking-tips",
];

export const PDP_ACCORDION_LABELS: Record<PdpAccordionId, string> = {
  description: "Description",
  details: "Details",
  storage: "Storage Instructions",
  "cooking-tips": "Cooking Tips",
};

export type ProductHighlightBadge = { id: string; label: string };

export function getProductHighlightBadges(
  freshnessTags: string[] = [],
  extraTags: string[] = [],
): ProductHighlightBadge[] {
  const badges: ProductHighlightBadge[] = [];

  freshnessTags.forEach((tag, index) => {
    const label = tag.trim();
    if (label) {
      badges.push({ id: `freshness-${index}`, label });
    }
  });

  extraTags.forEach((tag, index) => {
    const label = tag.trim();
    if (label) {
      badges.push({ id: `tag-${index}`, label });
    }
  });

  return badges;
}

export const PDP_PAYMENT_METHODS = [
  { id: "visa", label: "Visa" },
  { id: "mastercard", label: "Mastercard" },
  { id: "rupay", label: "RuPay" },
  { id: "upi", label: "UPI" },
] as const;

export function buildPdpDetailsBody(details: {
  categoryLabel: string;
  cutInfo: string;
  origin: string;
  sku: string;
}): string {
  const lines: string[] = [];
  if (details.categoryLabel) lines.push(`Category: ${details.categoryLabel}`);
  if (details.cutInfo) lines.push(`Cut: ${details.cutInfo}`);
  if (details.origin) lines.push(`Source: ${details.origin}`);
  if (details.sku) lines.push(`SKU: ${details.sku}`);
  return lines.join("\n");
}
