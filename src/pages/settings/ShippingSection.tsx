import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useShipping } from "@/hooks/useShipping";
import { useModal } from "@/hooks/useModal";
import type { ShippingMethod } from "@/types/master.types";
import type { ColorVariant } from "@/types/common.types";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

const ACTIVE_COLOR: Record<string, ColorVariant> = { Active: "green", Inactive: "gray" };

const toNum = (value: string | number | undefined): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const ShippingSection: React.FC = () => {
  const {
    settings,
    methods,
    isLoading,
    isSavingSettings,
    saveSettings,
    confirmDelete,
    reload,
  } = useShipping();
  const { openModal } = useModal();

  const [defaultFee, setDefaultFee] = useState("99");
  const [freeThreshold, setFreeThreshold] = useState("999");
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(true);

  useEffect(() => {
    if (!settings) return;
    setDefaultFee(String(toNum(settings.defaultShippingFee)));
    setFreeThreshold(String(toNum(settings.freeShippingThreshold)));
    setFreeShippingEnabled(settings.isFreeShippingEnabled);
  }, [settings]);

  const columns: DataTableOneColumn<ShippingMethod>[] = [
    {
      key: "method",
      header: "Method",
      render: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.code}</div>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.name,
    },
    {
      key: "fee",
      header: "Fee",
      render: (row) => `₹${toNum(row.fee).toFixed(2)}`,
    },
    {
      key: "delivery",
      header: "Delivery",
      render: (row) => row.deliveryLabel,
    },
    {
      key: "default",
      header: "Default",
      render: (row) => (row.isDefault ? <Badge variant="secondary">Yes</Badge> : null),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge
          status={row.isActive ? "Active" : "Inactive"}
          colorMap={ACTIVE_COLOR}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      hideable: false,
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              openModal("ShippingMethodCreateEdit", { shippingMethod: row, onSaved: reload })
            }
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => confirmDelete(row)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const handleSaveRates = async () => {
    await saveSettings({
      defaultShippingFee: toNum(defaultFee),
      freeShippingThreshold: toNum(freeThreshold),
      isFreeShippingEnabled: freeShippingEnabled,
    });
  };

  if (isLoading && !settings) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border border-border bg-card p-6">
        <PageHeader
          title="Shipping charges"
          subtitle="Default rates apply at checkout unless a shipping method overrides them."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="default-shipping-fee">Default shipping fee (₹)</Label>
            <Input
              id="default-shipping-fee"
              type="number"
              min={0}
              value={defaultFee}
              onChange={(e) => setDefaultFee(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="free-shipping-threshold">Free shipping above (₹)</Label>
            <Input
              id="free-shipping-threshold"
              type="number"
              min={0}
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Switch checked={freeShippingEnabled} onCheckedChange={setFreeShippingEnabled} />
          <Label>Enable free shipping threshold</Label>
        </div>
        <Button className="mt-6" onClick={() => void handleSaveRates()} disabled={isSavingSettings}>
          {isSavingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save rates
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <PageHeader
          title="Shipping methods"
          actions={
            <Button
              size="sm"
              onClick={() => openModal("ShippingMethodCreateEdit", { onSaved: reload })}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add method
            </Button>
          }
        />
        <DataTableOne
          columns={columns}
          data={methods}
          keyExtractor={(row) => row.id}
          emptyMessage="No shipping methods yet"
        />
      </div>
    </div>
  );
};
