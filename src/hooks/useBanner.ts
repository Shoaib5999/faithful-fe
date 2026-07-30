import { useState, useCallback, useMemo } from "react";
import type { Banner, BannerPosition } from "@/types/cms.types";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import { fetchBanners, createBanner, updateBanner, deleteBanner } from "@/services/banner-service";
import React from "react";

export const useBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<BannerPosition | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();
  const { openModal } = useModal();

  React.useEffect(() => {
    fetchBanners().then((b) => {
      setBanners(b);
      setIsLoading(false);
    });
  }, []);

  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || b.name.toLowerCase().includes(q);
      const matchesPosition = positionFilter === "all" || b.position === positionFilter;
      return matchesSearch && matchesPosition;
    });
  }, [banners, search, positionFilter]);

  const handleCreate = useCallback(async (input: Omit<Banner, "id">) => {
    const b = await createBanner(input);
    setBanners((prev) => [...prev, b]);
    notify("Banner created", "success");
  }, [notify]);

  const handleUpdate = useCallback(async (id: string, input: Partial<Omit<Banner, "id">>) => {
    const b = await updateBanner(id, input);
    setBanners((prev) => prev.map((x) => (x.id === id ? b : x)));
    notify("Banner updated", "success");
  }, [notify]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteBanner(id);
    setBanners((prev) => prev.filter((x) => x.id !== id));
    notify("Banner deleted", "success");
  }, [notify]);

  const confirmDelete = useCallback((banner: Banner) => {
    openModal("ConfirmAction", {
      title: "Delete Banner",
      description: `Are you sure you want to delete "${banner.name}"?`,
      variant: "destructive",
      onConfirm: () => handleDelete(banner.id),
    });
  }, [openModal, handleDelete]);

  return {
    banners, filteredBanners, isLoading,
    search, setSearch, positionFilter, setPositionFilter,
    handleCreate, handleUpdate, handleDelete, confirmDelete,
  };
};
