import type { Brand, Category, TaxClass } from "@/types/master.types";

type BrandWithFeatured = Brand & { isFeatured?: boolean };

const flattenCategories = (categories: Category[]): Category[] => {
  const out: Category[] = [];
  for (const c of categories) {
    out.push(c);
    if (c.children?.length) out.push(...c.children);
  }
  return out;
};

/** Default brand: featured → Faithful Meat slug/name → first active. */
export const resolveDefaultBrandId = (brands: BrandWithFeatured[]): string | null => {
  const active = brands.filter((b) => b.isActive);
  const featured = active.find((b) => b.isFeatured);
  if (featured) return featured.id;

  const faithfulMeat = active.find(
    (b) => b.slug === "faithful-meat" || b.name.toLowerCase().includes("faithful meat"),
  );
  if (faithfulMeat) return faithfulMeat.id;

  return active[0]?.id ?? null;
};

/** Default category by slug (chicken for new products). */
export const resolveDefaultCategoryId = (
  categories: Category[],
  slug = "chicken",
): string | null => {
  const match = flattenCategories(categories).find((c) => c.slug === slug && c.isActive);
  return match?.id ?? null;
};

/** Default tax class from admin isDefault flag. */
export const resolveDefaultTaxClassId = (taxClasses: TaxClass[]): string | null => {
  const active = taxClasses.filter((t) => t.isActive);
  const def = active.find((t) => t.isDefault);
  return def?.id ?? active[0]?.id ?? null;
};
