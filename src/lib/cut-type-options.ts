import type { CutType } from "@/types/cut-type.types";
import { CUT_TYPES } from "@/lib/product-api";

/** Admin/product editor options — API types first, hardcoded fallback if CMS empty. */
export const buildCutTypeOptions = (types: CutType[]) => {
  const active = types.filter((type) => type.isActive);
  if (active.length > 0) {
    return active.map((type) => ({ label: type.name, value: type.name }));
  }
  return CUT_TYPES.map((type) => ({ label: type, value: type }));
};
