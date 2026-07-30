import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import * as unitService from "@/services/unit-service";
import type { Unit, FormErrors } from "@/types/master.types";
import { getErrorMessage } from "@/lib/error";

export const useUnit = () => {
  const { units, setUnits } = useMasterData();
  const { notify } = useNotification();
  const { openModal, closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleCreate = async (input: Omit<Unit, "id" | "createdAt">) => {
    setIsLoading(true);
    try {
      await unitService.createUnit(input);
      const updated = await unitService.fetchUnits();
      setUnits(updated);
      notify("Unit created successfully", "success");
      closeModal();
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, input: Partial<Omit<Unit, "id" | "createdAt">>) => {
    setIsLoading(true);
    try {
      await unitService.updateUnit(id, input);
      const updated = await unitService.fetchUnits();
      setUnits(updated);
      notify("Unit updated successfully", "success");
      closeModal();
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await unitService.deleteUnit(id);
    const updated = await unitService.fetchUnits();
    setUnits(updated);
    notify("Unit deleted successfully", "success");
  };

  const confirmDelete = (unit: Unit) => {
    openModal("ConfirmAction", {
      title: "Delete Unit",
      description: `Are you sure you want to delete "${unit.name}"?`,
      variant: "destructive",
      confirmLabel: "Delete",
      onConfirm: () => handleDelete(unit.id),
    });
  };

  return { units, isLoading, formErrors, setFormErrors, handleCreate, handleUpdate, handleDelete, confirmDelete };
};
