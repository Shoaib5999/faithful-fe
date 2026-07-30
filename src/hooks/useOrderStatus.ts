import { useState } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import * as orderStatusService from "@/services/order-status-service";
import type { OrderStatus, FormErrors } from "@/types/master.types";
import { getErrorMessage } from "@/lib/error";

export const useOrderStatus = () => {
  const { orderStatuses, setOrderStatuses } = useMasterData();
  const { notify } = useNotification();
  const { openModal, closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleCreate = async (input: Omit<OrderStatus, "id">) => {
    setIsLoading(true);
    try {
      await orderStatusService.createOrderStatus(input);
      const updated = await orderStatusService.fetchOrderStatuses();
      setOrderStatuses(updated);
      notify("Order status created successfully", "success");
      closeModal();
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, input: Partial<Omit<OrderStatus, "id">>) => {
    setIsLoading(true);
    try {
      await orderStatusService.updateOrderStatus(id, input);
      const updated = await orderStatusService.fetchOrderStatuses();
      setOrderStatuses(updated);
      notify("Order status updated successfully", "success");
      closeModal();
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await orderStatusService.deleteOrderStatus(id);
      const updated = await orderStatusService.fetchOrderStatuses();
      setOrderStatuses(updated);
      notify("Order status deleted successfully", "success");
    } catch (error: any) {
      notify(getErrorMessage(error), "error");
    }
  };

  const handleReorder = async (orderedIds: string[]) => {
    const updated = await orderStatusService.reorderOrderStatuses(orderedIds);
    setOrderStatuses(updated);
  };

  const confirmDelete = (status: OrderStatus) => {
    openModal("ConfirmAction", {
      title: "Delete Order Status",
      description: `Are you sure you want to delete "${status.label}"?`,
      variant: "destructive",
      confirmLabel: "Delete",
      onConfirm: () => handleDelete(status.id),
    });
  };

  return { orderStatuses, isLoading, formErrors, setFormErrors, handleCreate, handleUpdate, handleDelete, handleReorder, confirmDelete };
};
