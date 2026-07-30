import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import * as currencyService from "@/services/currency-service";
import type { Currency, FormErrors } from "@/types/master.types";

export const useCurrency = () => {
  const { currencies, setCurrencies } = useMasterData();
  const { notify } = useNotification();
  const { openModal, closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleCreate = async (input: Omit<Currency, "id">) => {
    setIsLoading(true);
    try {
      await currencyService.createCurrency(input);
      const updated = await currencyService.fetchCurrencies();
      setCurrencies(updated);
      notify("Currency created successfully", "success");
      closeModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, input: Partial<Omit<Currency, "id">>) => {
    setIsLoading(true);
    try {
      await currencyService.updateCurrency(id, input);
      const updated = await currencyService.fetchCurrencies();
      setCurrencies(updated);
      notify("Currency updated successfully", "success");
      closeModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await currencyService.deleteCurrency(id);
    const updated = await currencyService.fetchCurrencies();
    setCurrencies(updated);
    notify("Currency deleted successfully", "success");
  };

  const confirmDelete = (currency: Currency) => {
    if (currency.isDefault) {
      notify("Cannot delete the default currency", "error");
      return;
    }
    openModal("ConfirmAction", {
      title: "Delete Currency",
      description: `Are you sure you want to delete "${currency.name}"?`,
      variant: "destructive",
      confirmLabel: "Delete",
      onConfirm: () => handleDelete(currency.id),
    });
  };

  return { currencies, isLoading, formErrors, setFormErrors, handleCreate, handleUpdate, handleDelete, confirmDelete };
};
