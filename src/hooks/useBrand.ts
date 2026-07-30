import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import * as brandService from "@/services/brand-service";
import type { Brand, FormErrors } from "@/types/master.types";
import { getErrorMessage } from "@/lib/error";

export const useBrand = () => {
  const { brands, setBrands } = useMasterData();
  const { notify } = useNotification();
  const { openModal, closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleCreate = async (input: Omit<Brand, "id" | "createdAt">) => {
    setIsLoading(true);
    try {
      await brandService.createBrand(input);

      const updated = await brandService.fetchBrands();
      setBrands(updated);

      notify("Brand created successfully", "success");
      closeModal();
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, input: Partial<Omit<Brand, "id" | "createdAt">>) => {
    setIsLoading(true);
    try {
      await brandService.updateBrand(id, input);
      const updated = await brandService.fetchBrands();
      setBrands(updated);
      notify("Brand updated successfully", "success");
      closeModal();
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await brandService.deleteBrand(id);
      const updated = await brandService.fetchBrands();
      setBrands(updated);
      notify("Brand deleted successfully", "success");
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    }
  };

  const confirmDelete = (brand: Brand) => {
    openModal("ConfirmAction", {
      title: "Delete Brand",
      description: `Are you sure you want to delete "${brand.name}"?`,
      variant: "destructive",
      confirmLabel: "Delete",
      onConfirm: () => handleDelete(brand.id),
    });
  };

  return { brands, isLoading, formErrors, setFormErrors, handleCreate, handleUpdate, handleDelete, confirmDelete };
};
