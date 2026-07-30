import React, { useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { usePaymentMode } from "@/hooks/usePaymentMode";
import { InlineAlert } from "@/components/common/InlineAlert";
import { NumberInput } from "@/components/common/NumberInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { generateCode } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/error";
import type { PaymentMode } from "@/types/commerce.types";
import type { FormErrors } from "@/types/master.types";

export const PaymentModeCreateEditModal: React.FC = () => {
  const { closeModal, payload } = useModal();
  const { handleCreate, handleUpdate } = usePaymentMode();

  const existing = payload.paymentMode as PaymentMode | undefined;
  const isEdit = !!existing;

  const [label, setLabel] = useState(existing?.label ?? "");
  const [code, setCode] = useState(existing?.code ?? "");
  const [isOnline, setIsOnline] = useState(existing?.isOnline ?? false);
  const [sortOrder, setSortOrder] = useState(existing?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    const e: FormErrors = {};
    if (!label.trim()) e.label = "Label is required";
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    setSaveError(null);
    const data = { label, code: code || generateCode(label), isOnline, sortOrder, isActive };

    try {
      if (isEdit && existing) {
        await handleUpdate(existing.id, data);
      } else {
        await handleCreate(data);
      }
      closeModal();
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModal open onOpenChange={() => closeModal()} title={isEdit ? "Edit Payment Mode" : "Create Payment Mode"}>
      <div className="flex flex-col gap-4 p-1">
        {saveError ? <InlineAlert type="error" message={saveError} /> : null}
        <div className="flex flex-col gap-1.5">
          <Label>Label</Label>
          <Input value={label} onChange={(e) => { setLabel(e.target.value); if (!isEdit) setCode(generateCode(e.target.value)); }} />
          <span className="text-xs text-muted-foreground ">{code}</span>
          {errors.label && <InlineAlert type="error" message={errors.label} />}
        </div>
        <div className="flex items-center gap-2"><Switch checked={isOnline} onCheckedChange={setIsOnline} /><Label>Available Online</Label></div>
        <div className="flex flex-col gap-1.5">
          <Label>Sort Order</Label>
          <NumberInput value={sortOrder} onChange={setSortOrder} min={0} />
        </div>
        <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active</Label></div>
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={() => void handleSave()} disabled={saving}>{saving ? "Saving..." : isEdit ? "Update" : "Create"}</Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
