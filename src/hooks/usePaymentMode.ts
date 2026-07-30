import { useState, useCallback } from "react";
import type { PaymentMode } from "@/types/commerce.types";
import { useMasterData } from "@/hooks/useMasterData";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import {
  createPaymentMode,
  updatePaymentMode,
  deletePaymentMode,
  fetchAdminPaymentModes,
} from "@/services/payment-mode-service";
import { getErrorMessage } from "@/lib/error";
import type { FormErrors } from "@/types/master.types";

export const usePaymentMode = () => {
  const { paymentModes, setPaymentModes } = useMasterData();
  const { notify } = useNotification();
  const { openModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const refreshPaymentModes = useCallback(async () => {
    const list = await fetchAdminPaymentModes();
    setPaymentModes(list);
    return list;
  }, [setPaymentModes]);

  const handleCreate = useCallback(async (input: Omit<PaymentMode, "id">) => {
    setIsLoading(true);
    try {
      await createPaymentMode(input);
      await refreshPaymentModes();
      notify("Payment mode created", "success");
    } catch (err) {
      notify(getErrorMessage(err), "error");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshPaymentModes, notify]);

  const handleUpdate = useCallback(async (id: string, input: Partial<Omit<PaymentMode, "id">>) => {
    setIsLoading(true);
    try {
      await updatePaymentMode(id, input);
      await refreshPaymentModes();
      notify("Payment mode updated", "success");
    } catch (err) {
      notify(getErrorMessage(err), "error");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshPaymentModes, notify]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deletePaymentMode(id);
      await refreshPaymentModes();
      notify("Payment mode deleted", "success");
    } catch (err) {
      notify(getErrorMessage(err), "error");
      throw err;
    }
  }, [refreshPaymentModes, notify]);

  const confirmDelete = useCallback((pm: PaymentMode) => {
    openModal("ConfirmAction", {
      title: "Delete Payment Mode",
      description: `Are you sure you want to delete "${pm.label}"? Prefer deactivating if it has been used on orders.`,
      variant: "destructive",
      onConfirm: () => handleDelete(pm.id),
    });
  }, [openModal, handleDelete]);

  return {
    paymentModes,
    handleCreate,
    handleUpdate,
    handleDelete,
    confirmDelete,
    refreshPaymentModes,
    isLoading,
    formErrors,
    setFormErrors,
  };
};
