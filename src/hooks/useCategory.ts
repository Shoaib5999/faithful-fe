import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMasterData } from "@/hooks/useMasterData";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import { STOREFRONT_CATEGORIES_QUERY_KEY } from "@/hooks/useStorefrontCategories";
import * as categoryService from "@/services/category-service";
import type { Category, FormErrors } from "@/types/master.types";
import { getErrorMessage } from "@/lib/error";

const removeCategoryFromTree = (categories: Category[], id: string): Category[] =>
  categories
    .filter((category) => category.id !== id)
    .map((category) => ({
      ...category,
      children: category.children?.length
        ? removeCategoryFromTree(category.children, id)
        : category.children,
    }));

export const useCategory = () => {
  const { categories, setCategories } = useMasterData();
  const { notify } = useNotification();
  const { openModal, closeModal } = useModal();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const invalidateStorefrontCategories = () => {
    void queryClient.invalidateQueries({ queryKey: STOREFRONT_CATEGORIES_QUERY_KEY });
  };

  const handleCreate = async (input: Omit<Category, "id">) => {
    setIsLoading(true);
    try {
      await categoryService.createCategory(input);
      const updated = await categoryService.fetchCategories();
      setCategories(updated);
      invalidateStorefrontCategories();
      notify("Category created successfully", "success");
      closeModal();
    } catch (error: unknown) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, input: Partial<Omit<Category, "id">>) => {
    setIsLoading(true);
    try {
      await categoryService.updateCategory(id, input);
      const updated = await categoryService.fetchCategories();
      setCategories(updated);
      invalidateStorefrontCategories();
      notify("Category updated successfully", "success");
      closeModal();
    } catch (error: unknown) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => removeCategoryFromTree(prev, id));
      const updated = await categoryService.fetchCategories();
      setCategories(updated);
      invalidateStorefrontCategories();
      notify("Category deleted successfully", "success");
    } catch (error: unknown) {
      notify(getErrorMessage(error), "error");
    }
  };

  const confirmDelete = (category: Category) => {
    openModal("ConfirmAction", {
      title: "Delete Category",
      description: `Are you sure you want to delete "${categoryService.getCategoryDisplayName(category)}"?`,
      variant: "destructive",
      confirmLabel: "Delete",
      onConfirm: () => handleDelete(category.id),
    });
  };

  return { categories, isLoading, formErrors, setFormErrors, handleCreate, handleUpdate, handleDelete, confirmDelete };
};
