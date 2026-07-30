import { useState, useCallback, useEffect } from "react";
import type { HomeImage } from "@/types/cms.types";
import { useNotification } from "@/hooks/useNotification";
import { fetchHomeImages, updateHomeImage } from "@/services/home-image-service";

export const useHomeImage = () => {
  const [homeImages, setHomeImages] = useState<HomeImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();

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

  return {
    homeImages,
    isLoading,
    loadHomeImages,
    handleUpdate,
  };
};
