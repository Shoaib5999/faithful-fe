import type { Category } from "@/types/master.types";
import { api } from "@/services/api";

const ADMIN_CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  "incense-stick": "Agarbatti",
};

export const getCategoryDisplayName = (
  category: Pick<Category, "name" | "slug">,
): string => ADMIN_CATEGORY_LABEL_OVERRIDES[category.slug] ?? category.name;

export const fetchCategories = async (): Promise<Category[]> => {
  const data = await api.get<Category[]>(
    "/master/categories"
  );

  return data;
};

export const createCategory = async (
  input: Omit<Category, "id">
): Promise<Category> => {
  const data = await api.post<Category>(
    "/master/categories",
    input
  );

  return data;
};

export const updateCategory = async (
  id: string,
  input: Partial<Omit<Category, "id">>
): Promise<Category> => {
  const data = await api.put<Category>(
    `/master/categories/${id}`,
    input
  );

  return data;
};

export const deleteCategory = async (
  id: string
): Promise<void> => {
  await api.delete(`/master/categories/${id}`);
};

export const getTopLevel = (
  categories: Category[]
): Category[] => {
  return categories.filter(
    (c) => c.parentId === null
  );
};

export const getChildren = (
  categories: Category[],
  parentId: string
): Category[] => {
  return categories.filter(
    (c) => c.parentId === parentId
  );
};

export const flattenCategoryOptions = (
  categories: Category[],
): { label: string; value: string }[] => {
  const top = getTopLevel(categories);
  const options: { label: string; value: string }[] = [];

  for (const parent of top) {
    const parentLabel = getCategoryDisplayName(parent);
    options.push({ label: parentLabel, value: parent.id });
    const children =
      parent.children?.length
        ? parent.children
        : getChildren(categories, parent.id);
    for (const child of children) {
      options.push({
        label: `${parentLabel} › ${getCategoryDisplayName(child)}`,
        value: child.id,
      });
    }
  }

  return options;
};