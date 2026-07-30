import React, { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { useInventory } from "@/hooks/useInventory";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatRelativeTime } from "@/lib/formatters";
import type { InventoryRecord, InventoryAdjustment } from "@/types/commerce.types";
import type { ColorVariant } from "@/types/common.types";

const TYPE_COLOR: Record<string, ColorVariant> = { add: "green", remove: "red", set: "blue" };

export const InventoryHistoryModal: React.FC = () => {
  const { closeModal, payload } = useModal();
  const { getHistoryForRecord } = useInventory();

  const inventory = (payload?.inventory ?? payload?.inventoryRecord) as InventoryRecord | undefined;

  const [history, setHistory] = useState<InventoryAdjustment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inventory?.id) {
      setLoading(false);
      return;
    }
    getHistoryForRecord(inventory.id).then((h) => {
      setHistory(h);
      setLoading(false);
    });
  }, [inventory?.id, getHistoryForRecord]);

  if (!inventory?.id) return null;

  return (
    <ResponsiveModal open onOpenChange={() => closeModal()} title="Inventory History">
      <div className="flex flex-col gap-4 p-1">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{inventory.productName ?? "Product"}</span>
          {inventory.variantLabel && (
            <span className="text-sm text-muted-foreground">{inventory.variantLabel}</span>
          )}
        </div>

        {history.length === 0 && !loading ? (
          <EmptyState title="No adjustments" description="No inventory adjustments have been made yet" />
        ) : (
          <div className="flex flex-col gap-0 relative">
            {history.map((adj, idx) => (
              <div key={adj.id} className="flex gap-3 relative pb-6">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full shrink-0 mt-1 ${adj.type === "add" ? "bg-green-500" : adj.type === "remove" ? "bg-destructive" : "bg-blue-500"}`} />
                  {idx < history.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={adj.type} colorMap={TYPE_COLOR} />
                    <span className="font-medium text-sm">
                      {adj.type === "add" ? "+" : adj.type === "remove" ? "-" : ""}{adj.quantity}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{adj.reason}</span>
                  {(adj.productName || adj.variantLabel) && (
                    <span className="text-xs text-muted-foreground">
                      {[adj.productName, adj.variantLabel].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{adj.previousQuantity}</span>
                    <span>→</span>
                    <span>{adj.newQuantity}</span>
                    <span className="ml-2">{formatRelativeTime(adj.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
};
