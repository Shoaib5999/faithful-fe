import { useState, useCallback, useEffect } from "react";
import type { Slider } from "@/types/cms.types";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import {
  fetchSliders,
  createSlider,
  updateSlider,
  deleteSlider,
  reorderSliders,
} from "@/services/slider-service";

export const useSlider = () => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();
  const { openModal } = useModal();

  const loadSliders = useCallback(async () => {
    const list = await fetchSliders();
    setSliders(list);
    return list;
  }, []);

  useEffect(() => {
    loadSliders()
      .catch(() => notify("Failed to load sliders", "error"))
      .finally(() => setIsLoading(false));
  }, [loadSliders, notify]);

  const handleCreate = useCallback(
    async (input: Omit<Slider, "id">) => {
      const slider = await createSlider(input);
      setSliders((prev) => [...prev, slider]);
      notify("Slider created", "success");
    },
    [notify],
  );

  const handleUpdate = useCallback(
    async (id: string, input: Partial<Omit<Slider, "id">>) => {
      const slider = await updateSlider(id, input);
      setSliders((prev) => prev.map((item) => (item.id === id ? slider : item)));
      notify("Slider updated", "success");
    },
    [notify],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteSlider(id);
      setSliders((prev) => prev.filter((item) => item.id !== id));
      notify("Slider deleted", "success");
    },
    [notify],
  );

  const handleReorder = useCallback(async (orderedIds: string[]) => {
    const updated = await reorderSliders(orderedIds);
    setSliders(updated);
  }, []);

  const confirmDelete = useCallback(
    (slider: Slider) => {
      openModal("ConfirmAction", {
        title: "Delete Slider",
        description: `Are you sure you want to delete "${slider.title}"?`,
        variant: "destructive",
        onConfirm: () => handleDelete(slider.id),
      });
    },
    [openModal, handleDelete],
  );

  return {
    sliders,
    isLoading,
    loadSliders,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleReorder,
    confirmDelete,
  };
};
