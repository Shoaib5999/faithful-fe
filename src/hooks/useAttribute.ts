import { useState, useCallback } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import * as attributeService from "@/services/attribute-service";
import type { Attribute, AttributeCreateInput, FormErrors } from "@/types/master.types";
import { getErrorMessage } from "@/lib/error";

export const useAttribute = () => {
  const { attributes, setAttributes } = useMasterData();
  const { notify } = useNotification();
  const { openModal, closeModal } = useModal();

  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const refreshAttributes = useCallback(async () => {
    const updated = await attributeService.fetchAttributes();
    setAttributes(updated);
    return updated;
  }, [setAttributes]);

  const handleCreate = async (input: AttributeCreateInput) => {
    setIsLoading(true);
    try {
      await attributeService.createAttribute(input);
      const updated = await attributeService.fetchAttributes();
      setAttributes(updated);
      notify("Attribute created successfully", "success");
      closeModal();
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (
    id: string,
    input: Partial<AttributeCreateInput>
  ) => {
    setIsLoading(true);
    try {
      await attributeService.updateAttribute(id, input);
      const updated = await attributeService.fetchAttributes();
      setAttributes(updated);
      notify("Attribute updated successfully", "success");
      closeModal();
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await attributeService.deleteAttribute(id);
      await refreshAttributes();

      notify("Attribute deleted successfully", "success");
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    }
  };

  const confirmDelete = (attribute: Attribute) => {
    openModal("ConfirmAction", {
      title: "Delete Attribute",
      description: `Are you sure you want to delete "${attribute.name}"?`,
      variant: "destructive",
      confirmLabel: "Delete",
      onConfirm: () => handleDelete(attribute.id),
    });
  };

  return {
    attributes,
    isLoading,
    formErrors,
    setFormErrors,
    handleCreate,
    handleUpdate,
    handleDelete,
    confirmDelete,
    refreshAttributes,
  };
};