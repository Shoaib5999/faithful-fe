import React, { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { useInventory } from "@/hooks/useInventory";
import { useAuth } from "@/hooks/useAuth";
import { NumberInput } from "@/components/common/NumberInput";
import { InlineAlert } from "@/components/common/InlineAlert";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { InventoryRecord } from "@/types/commerce.types";

export const InventoryAdjustModal: React.FC = () => {
  const { closeModal, payload } = useModal();
  const { handleAdjust } = useInventory();
  const { user } = useAuth();

  const inventory = (payload?.inventory ?? payload?.inventoryRecord ?? payload) as InventoryRecord | undefined;

  const [adjustType, setAdjustType] = useState<"add" | "remove" | "set">("add");
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (!inventory) return null;
  const currentQty = inventory.quantity;
  const computedNew = adjustType === "add" ? currentQty + quantity
    : adjustType === "remove" ? currentQty - quantity
    : quantity;

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (quantity <= 0 && adjustType !== "set") e.quantity = "Quantity must be positive";
    if (quantity < 0 && adjustType === "set") e.quantity = "Quantity cannot be negative";
    if (!reason.trim()) e.reason = "Reason is required";
    if (adjustType === "remove" && quantity > currentQty) e.quantity = "Cannot remove more than current stock";
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    try {
      await handleAdjust(inventory.id, { type: adjustType, quantity, reason, createdBy: user?.name ?? "System" });
      closeModal();
    } catch {
      // Error surfaced by useInventory / toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModal open onOpenChange={() => closeModal()} title="Adjust Inventory">
      <div className="flex flex-col gap-4 p-1">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{inventory.productName ?? "Product"}</span>
          {inventory.variantLabel && (
            <span className="text-sm text-muted-foreground">{inventory.variantLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Current Stock:</span>
          <span className="text-2xl font-bold">{currentQty}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Adjustment Type</Label>
          <RadioGroup value={adjustType} onValueChange={(v) => setAdjustType(v as "add" | "remove" | "set")} className="flex gap-4">
            <div className="flex items-center gap-2"><RadioGroupItem value="add" id="add" /><Label htmlFor="add">Add</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem value="remove" id="remove" /><Label htmlFor="remove">Remove</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem value="set" id="set" /><Label htmlFor="set">Set to</Label></div>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Quantity</Label>
          <NumberInput value={quantity} onChange={setQuantity} min={adjustType === "set" ? 0 : 1} />
          {errors.quantity && <InlineAlert type="error" message={errors.quantity} />}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Reason</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for adjustment..." />
          {errors.reason && <InlineAlert type="error" message={errors.reason} />}
        </div>

        <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
          <span className="text-sm text-muted-foreground">New Quantity:</span>
          <span className={`text-xl font-bold ${computedNew < 0 ? "text-destructive" : ""}`}>{computedNew}</span>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Apply"}</Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
