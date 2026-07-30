import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import * as taxClassService from "@/services/tax-class-service";
import type { TaxClass, FormErrors } from "@/types/master.types";
import { getErrorMessage } from "@/lib/error";

export const useTaxClass = () => {
  const { taxClasses, setTaxClasses } = useMasterData();
  const { notify } = useNotification();
  const { openModal, closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleCreate = async (input: Omit<TaxClass, "id">) => {
    setIsLoading(true);
    try {
      await taxClassService.createTaxClass(input);
      const updated = await taxClassService.fetchTaxClasses();
      setTaxClasses(updated);
      notify("Tax class created successfully", "success");
      closeModal();
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, input: Partial<Omit<TaxClass, "id">>) => {
    setIsLoading(true);
    try {
      await taxClassService.updateTaxClass(id, input);
      const updated = await taxClassService.fetchTaxClasses();
      setTaxClasses(updated);
      notify("Tax class updated successfully", "success");
      closeModal();
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await taxClassService.deleteTaxClass(id);
      const updated = await taxClassService.fetchTaxClasses();
      setTaxClasses(updated);
      notify("Tax class deleted successfully", "success");
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (taxClass: TaxClass) => {
    openModal("ConfirmAction", {
      title: "Delete Tax Class",
      description: `Are you sure you want to delete "${taxClass.name}"?`,
      variant: "destructive",
      confirmLabel: "Delete",
      onConfirm: () => handleDelete(taxClass.id),
    });
  };

  return { taxClasses, isLoading, formErrors, setFormErrors, handleCreate, handleUpdate, handleDelete, confirmDelete };
};
