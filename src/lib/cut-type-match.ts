import { generateSlug } from "@/lib/formatters";

export const productMatchesCutTypeSlug = (
  productTypes: string[],
  filterSlug: string,
): boolean => {
  const target = filterSlug.trim().toLowerCase();
  if (!target || productTypes.length === 0) return false;

  return productTypes.some((type) => {
    const normalized = type.trim().toLowerCase();
    return normalized === target || generateSlug(type) === target;
  });
};
