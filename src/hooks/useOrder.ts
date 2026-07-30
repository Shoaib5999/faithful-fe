import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useMasterData } from "@/hooks/useMasterData";
import {
  ORDERS_QK,
  fetchOrders,
  updateOrderStatus,
  addOrderNote,
} from "@/services/order-service";
import {
  orderMatchesProductSearch,
  orderMatchesProductLine,
  ordersNeedShiprocketPolling,
  ORDERS_SHIPROCKET_POLL_MS,
  type ProductLineFilter,
} from "@/lib/order-display";
import React from "react";

export const useOrder = () => {
  const queryClient = useQueryClient();
  const { orderStatuses } = useMasterData();
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [productLineFilter, setProductLineFilter] = useState<ProductLineFilter>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | null>(null);
  const { notify } = useNotification();

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ORDERS_QK,
    queryFn: fetchOrders,
    refetchInterval: (query) => {
      const orders = query.state.data;
      if (!orders || !ordersNeedShiprocketPolling(orders, orderStatuses)) {
        return false;
      }
      return ORDERS_SHIPROCKET_POLL_MS;
    },
  });

  const orders = data ?? [];
  /** Skeleton only on first load; refetches keep showing rows (avoids stuck skeleton). */
  const isLoading = isFetching && data === undefined;

  React.useEffect(() => {
    if (isError && error) notify(error instanceof Error ? error.message : "Failed to load orders", "error");
  }, [isError, error, notify]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q) ||
        (o.customer.email?.toLowerCase().includes(q) ?? false) ||
        orderMatchesProductSearch(o, q);
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(o.status);
      let matchesDate = true;
      if (dateRange?.from) {
        matchesDate = new Date(o.createdAt) >= dateRange.from;
      }
      if (matchesDate && dateRange?.to) {
        matchesDate = new Date(o.createdAt) <= dateRange.to;
      }
      return matchesSearch && matchesStatus && matchesDate && orderMatchesProductLine(o, productLineFilter);
    });
  }, [orders, search, statusFilters, dateRange, productLineFilter]);

  const handleUpdateStatus = useCallback(
    async (orderId: string, toStatus: string, note: string, createdBy: string) => {
      try {
        await updateOrderStatus(orderId, { toStatus, note, createdBy });
        await queryClient.invalidateQueries({ queryKey: ORDERS_QK });
        await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        notify(`Order status updated to ${toStatus.replace(/_/g, " ")}`, "success");
      } catch (err: unknown) {
        notify(err instanceof Error ? err.message : "Failed to update order status", "error");
        throw err;
      }
    },
    [queryClient, notify]
  );

  const handleAddNote = useCallback(
    async (orderId: string, note: string) => {
      try {
        await addOrderNote(orderId, note);
        await queryClient.invalidateQueries({ queryKey: ORDERS_QK });
        await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        notify("Note added", "success");
      } catch (err: unknown) {
        notify(err instanceof Error ? err.message : "Failed to add note", "error");
      }
    },
    [queryClient, notify]
  );

  const refreshOrders = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ORDERS_QK });
  }, [queryClient]);

  return {
    orders,
    filteredOrders,
    isLoading,
    search,
    setSearch,
    statusFilters,
    setStatusFilters,
    dateRange,
    setDateRange,
    productLineFilter,
    setProductLineFilter,
    handleUpdateStatus,
    handleAddNote,
    refreshOrders,
  };
};
