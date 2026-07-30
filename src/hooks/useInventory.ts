import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { InventoryRecord, InventoryAdjustment } from "@/types/commerce.types";
import { useNotification } from "@/hooks/useNotification";
import { fetchInventory, adjustInventory, getAdjustmentHistory, updateThreshold } from "@/services/inventory-service";
import { PRODUCTS_LIST_QK } from "@/services/product-service";
import React from "react";

type StockStatus = "all" | "in_stock" | "low_stock" | "out_of_stock";

export const useInventory = () => {
  const queryClient = useQueryClient();
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();

  React.useEffect(() => {
    fetchInventory()
      .then((r) => setRecords(r))
      .catch((err: unknown) => {
        notify(err instanceof Error ? err.message : "Failed to load inventory", "error");
      })
      .finally(() => setIsLoading(false));
  }, [notify]);

  const refreshRecords = useCallback(async () => {
    const r = await fetchInventory();
    setRecords(r);
  }, []);

  const getStockStatus = useCallback((r: InventoryRecord): "in_stock" | "low_stock" | "out_of_stock" => {
    if (r.quantity === 0) return "out_of_stock";
    if (r.quantity <= r.threshold) return "low_stock";
    return "in_stock";
  }, []);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchesSearch =
        !q ||
        (r.productName?.toLowerCase().includes(q) ?? false) ||
        (r.variantLabel?.toLowerCase().includes(q) ?? false) ||
        (r.productSku?.toLowerCase().includes(q) ?? false);
      const matchesStatus = stockFilter === "all" || getStockStatus(r) === stockFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, stockFilter, getStockStatus]);

  const handleAdjust = useCallback(async (
    inventoryId: string,
    input: { type: "add" | "remove" | "set"; quantity: number; reason: string; createdBy: string }
  ) => {
    try {
      await adjustInventory(inventoryId, input);
      await refreshRecords();
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_QK });
      notify("Inventory adjusted", "success");
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to adjust stock", "error");
    }
  }, [refreshRecords, notify, queryClient]);

  const handleUpdateThreshold = useCallback(async (inventoryId: string, threshold: number) => {
    try {
      await updateThreshold(inventoryId, threshold);
      await refreshRecords();
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_QK });
      notify("Threshold updated", "success");
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to update threshold", "error");
    }
  }, [refreshRecords, notify, queryClient]);

  const getHistoryForRecord = useCallback(async (inventoryId: string): Promise<InventoryAdjustment[]> => {
    return getAdjustmentHistory(inventoryId);
  }, []);

  return {
    records, filteredRecords, isLoading,
    search, setSearch, stockFilter, setStockFilter,
    handleAdjust, handleUpdateThreshold, getHistoryForRecord, refreshRecords, getStockStatus,
  };
};
