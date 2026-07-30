import { useCallback, useEffect, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import {
  createCutType,
  deleteCutType,
  fetchCutTypes,
  reorderCutTypes,
  updateCutType,
} from "@/services/cut-type-service";
import type { CutType, CutTypeInput } from "@/types/cut-type.types";
import { getErrorMessage } from "@/lib/error";

export const useCutType = () => {
  const [types, setTypes] = useState<CutType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();
  const { openModal } = useModal();

  const loadTypes = useCallback(async () => {
    const list = await fetchCutTypes();
    setTypes(list);
    return list;
  }, []);

  useEffect(() => {
    loadTypes()
      .catch((error) => notify(getErrorMessage(error) || "Failed to load cut types", "error"))
      .finally(() => setIsLoading(false));
  }, [loadTypes, notify]);

  const handleCreate = useCallback(
    async (input: CutTypeInput) => {
      try {
        const type = await createCutType(input);
        setTypes((prev) => [...prev, type]);
        notify("Cut type created", "success");
        return true;
      } catch (error) {
        notify(getErrorMessage(error), "error");
        return false;
      }
    },
    [notify],
  );

  const handleUpdate = useCallback(
    async (id: string, input: Partial<CutTypeInput>) => {
      try {
        const type = await updateCutType(id, input);
        setTypes((prev) => prev.map((item) => (item.id === id ? type : item)));
        notify("Cut type updated", "success");
        return true;
      } catch (error) {
        notify(getErrorMessage(error), "error");
        return false;
      }
    },
    [notify],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteCutType(id);
        setTypes((prev) => prev.filter((item) => item.id !== id));
        notify("Cut type deleted", "success");
        return true;
      } catch (error) {
        notify(getErrorMessage(error), "error");
        return false;
      }
    },
    [notify],
  );

  const handleReorder = useCallback(
    async (orderedIds: string[]) => {
      try {
        const updated = await reorderCutTypes(orderedIds);
        setTypes(updated);
        return true;
      } catch (error) {
        notify(getErrorMessage(error), "error");
        return false;
      }
    },
    [notify],
  );

  const confirmDelete = useCallback(
    (type: CutType) => {
      openModal("ConfirmAction", {
        title: "Delete cut type",
        description: `Are you sure you want to delete "${type.name}"? Existing products keep their type tags.`,
        variant: "destructive",
        onConfirm: () => handleDelete(type.id),
      });
    },
    [openModal, handleDelete],
  );

  return {
    types,
    isLoading,
    loadTypes,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleReorder,
    confirmDelete,
  };
};
