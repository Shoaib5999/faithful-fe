import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberInput } from "@/components/common/NumberInput";
import { Plus, Trash2 } from "lucide-react";
import type { TieredPrice } from "@/types/product-schema.types";
import { generateId } from "@/lib/formatters";

interface TieredPriceEditorProps {
  tiers: TieredPrice[];
  onChange: (tiers: TieredPrice[]) => void;
  customerGroups?: { label: string; value: string }[];
}

const DEFAULT_GROUPS = [
  { label: "All Customers", value: "all" },
  { label: "Retail", value: "retail" },
  { label: "Wholesale", value: "wholesale" },
  { label: "VIP", value: "vip" },
];

export const TieredPriceEditor: React.FC<TieredPriceEditorProps> = ({
  tiers, onChange, customerGroups = DEFAULT_GROUPS,
}) => {
  const addTier = () => {
    const last = tiers[tiers.length - 1];
    onChange([...tiers, {
      id: generateId(),
      minQuantity: last ? (last.maxQuantity ?? last.minQuantity) + 1 : 1,
      maxQuantity: null,
      price: 0,
      customerGroup: null,
    }]);
  };

  const updateTier = (id: string, patch: Partial<TieredPrice>) => {
    onChange(tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const removeTier = (id: string) => {
    onChange(tiers.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {tiers.length === 0 && (
        <p className="text-xs text-muted-foreground">No tier breaks defined. Add quantity-based pricing tiers.</p>
      )}
      {tiers.map((tier) => (
        <div key={tier.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1.2fr_auto] gap-2 items-end p-2 rounded-md border border-border bg-muted/30">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Min Qty</Label>
            <NumberInput value={tier.minQuantity} onChange={(v) => updateTier(tier.id, { minQuantity: v })} min={1} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Max Qty</Label>
            <Input
              type="number"
              value={tier.maxQuantity ?? ""}
              placeholder="∞"
              onChange={(e) => updateTier(tier.id, { maxQuantity: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Price</Label>
            <NumberInput value={tier.price} onChange={(v) => updateTier(tier.id, { price: v })} min={0} prefix="₹" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Customer Group</Label>
            <Select
              value={tier.customerGroup ?? "all"}
              onValueChange={(v) => updateTier(tier.id, { customerGroup: v === "all" ? null : v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {customerGroups.map((g) => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="icon" onClick={() => removeTier(tier.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addTier} className="self-start">
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Tier
      </Button>
    </div>
  );
};
