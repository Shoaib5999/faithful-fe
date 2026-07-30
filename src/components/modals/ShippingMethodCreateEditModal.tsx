import React, { useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NumberInput } from "@/components/common/NumberInput";
import { useModal } from "@/hooks/useModal";
import { useNotification } from "@/hooks/useNotification";
import * as shippingConfigService from "@/services/shipping-config-service";
import { generateCode } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/error";
import { isRequired } from "@/lib/validators";
import type { ShippingMethod, FormErrors } from "@/types/master.types";
import { Loader2 } from "lucide-react";

export const ShippingMethodCreateEditModal: React.FC = () => {
  const { payload, closeModal } = useModal();
  const { notify } = useNotification();

  const existing = payload.shippingMethod as ShippingMethod | undefined;
  const onSaved = payload.onSaved as (() => void | Promise<void>) | undefined;
  const isEdit = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? "");
  const [code, setCode] = useState(existing?.code ?? "");
  const [fee, setFee] = useState(Number(existing?.fee ?? 0));
  const [deliveryLabel, setDeliveryLabel] = useState(existing?.deliveryLabel ?? "");
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? false);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(existing?.sortOrder ?? 0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!isRequired(name)) e.name = "Name is required";
    if (!isRequired(deliveryLabel)) e.deliveryLabel = "Delivery time is required";
    if (!Number.isFinite(fee) || fee < 0) e.fee = "Fee must be zero or greater";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    const data = {
      name,
      code: code || generateCode(name),
      fee,
      deliveryLabel,
      isDefault,
      isActive,
      sortOrder,
    };

    try {
      if (isEdit && existing) {
        await shippingConfigService.updateShippingMethod(existing.id, data);
        notify("Shipping method updated", "success");
      } else {
        await shippingConfigService.createShippingMethod(data);
        notify("Shipping method created", "success");
      }
      await onSaved?.();
      closeModal();
    } catch (error) {
      notify(getErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModal
      open
      onOpenChange={closeModal}
      title={isEdit ? "Edit Shipping Method" : "Add Shipping Method"}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!isEdit) setCode(generateCode(e.target.value));
            }}
            placeholder="Standard Delivery"
          />
          {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Code</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="standard"
            disabled={isEdit}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fee (₹)</Label>
          <NumberInput value={fee} onChange={setFee} min={0} />
          {errors.fee && <span className="text-xs text-destructive">{errors.fee}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Delivery</Label>
          <Input
            value={deliveryLabel}
            onChange={(e) => setDeliveryLabel(e.target.value)}
            placeholder="5-7 business days"
          />
          {errors.deliveryLabel && (
            <span className="text-xs text-destructive">{errors.deliveryLabel}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Sort Order</Label>
          <NumberInput value={sortOrder} onChange={setSortOrder} min={0} />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isDefault} onCheckedChange={setIsDefault} />
          <Label>Default</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Active</Label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
