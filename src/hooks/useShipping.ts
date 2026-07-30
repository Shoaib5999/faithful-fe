import { useCallback, useEffect, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import * as shippingConfigService from "@/services/shipping-config-service";
import type { ShippingMethod, ShippingSettings } from "@/types/master.types";
import { getErrorMessage } from "@/lib/error";

export const useShipping = () => {
  const { notify } = useNotification();
  const { openModal, closeModal } = useModal();
  const [settings, setSettings] = useState<ShippingSettings | null>(null);
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nextSettings, nextMethods] = await Promise.all([
        shippingConfigService.fetchShippingSettings(),
        shippingConfigService.fetchShippingMethods(true),
      ]);
      setSettings(nextSettings);
      setMethods(nextMethods);
    } catch (error) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveSettings = async (
    input: Pick<ShippingSettings, "defaultShippingFee" | "freeShippingThreshold" | "isFreeShippingEnabled">,
  ) => {
    setIsSavingSettings(true);
    try {
      const updated = await shippingConfigService.updateShippingSettings(input);
      setSettings(updated);
      notify("Shipping rates saved", "success");
    } catch (error) {
      notify(getErrorMessage(error), "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreate = async (input: Omit<ShippingMethod, "id">) => {
    try {
      await shippingConfigService.createShippingMethod(input);
      await reload();
      notify("Shipping method created", "success");
      closeModal();
    } catch (error) {
      notify(getErrorMessage(error), "error");
    }
  };

  const handleUpdate = async (id: string, input: Partial<Omit<ShippingMethod, "id">>) => {
    try {
      await shippingConfigService.updateShippingMethod(id, input);
      await reload();
      notify("Shipping method updated", "success");
      closeModal();
    } catch (error) {
      notify(getErrorMessage(error), "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await shippingConfigService.deleteShippingMethod(id);
      await reload();
      notify("Shipping method deleted", "success");
    } catch (error) {
      notify(getErrorMessage(error), "error");
    }
  };

  const confirmDelete = (method: ShippingMethod) => {
    openModal("ConfirmAction", {
      title: "Delete Shipping Method",
      description: `Are you sure you want to delete "${method.name}"?`,
      variant: "destructive",
      confirmLabel: "Delete",
      onConfirm: () => handleDelete(method.id),
    });
  };

  return {
    settings,
    methods,
    isLoading,
    isSavingSettings,
    saveSettings,
    handleCreate,
    handleUpdate,
    confirmDelete,
    reload,
  };
};
