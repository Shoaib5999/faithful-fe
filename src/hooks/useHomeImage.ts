import { useState, useCallback, useEffect } from "react";
import type { HomeImage } from "@/types/cms.types";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import {
  fetchHomeImages,
  updateHomeImage,
  createHomeImage,
  deleteHomeImage,
} from "@/services/home-image-service";

export const useHomeImage = () => {
  const [homeImages, setHomeImages] = useState<HomeImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();
  const { openModal } = useModal();

  const loadHomeImages = useCallback(async () => {
    const list = await fetchHomeImages();
    setHomeImages(list);
    return list;
  }, []);

  useEffect(() => {
    loadHomeImages()
      .catch(() => notify("Failed to load homepage images", "error"))
      .finally(() => setIsLoading(false));
  }, [loadHomeImages, notify]);

  const handleUpdate = useCallback(
    async (id: string, input: Partial<Omit<HomeImage, "id" | "slotKey" | "section">>) => {
      const item = await updateHomeImage(id, input);
      setHomeImages((prev) => prev.map((row) => (row.id === id ? item : row)));
      notify("Homepage image updated", "success");
      return item;
    },
    [notify],
  );

  const handleCreate = useCallback(
    async (
      input: Pick<HomeImage, "section" | "title"> &
        Partial<Omit<HomeImage, "id" | "slotKey" | "section" | "title" | "sortOrder">>,
    ) => {
      const item = await createHomeImage(input);
      setHomeImages((prev) => [...prev, item]);
      notify("Homepage image added", "success");
      return item;
    },
    [notify],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteHomeImage(id);
      setHomeImages((prev) => prev.filter((row) => row.id !== id));
      notify("Homepage image deleted", "success");
    },
    [notify],
  );

  const confirmDelete = useCallback(
    (item: HomeImage) => {
      openModal("ConfirmAction", {
        title: "Delete Homepage Image",
        description: `Are you sure you want to delete "${item.title}"?`,
        variant: "destructive",
        onConfirm: () => handleDelete(item.id),
      });
    },
    [openModal, handleDelete],
  );

  return {
    homeImages,
    isLoading,
    loadHomeImages,
    handleUpdate,
    handleCreate,
    handleDelete,
    confirmDelete,
  };
};
