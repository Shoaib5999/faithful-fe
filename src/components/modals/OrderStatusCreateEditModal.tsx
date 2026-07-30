import React, { useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "@/components/common/ColorPicker";
import { useModal } from "@/hooks/useModal";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { generateCode } from "@/lib/formatters";
import { isRequired } from "@/lib/validators";
import type { OrderStatus, FormErrors } from "@/types/master.types";
import type { ColorVariant } from "@/types/common.types";
import { STATUS_VARIANT_HEX } from "@/lib/status-colors";
import { Loader2 } from "lucide-react";

const COLOR_HEX_MAP = STATUS_VARIANT_HEX;

const HEX_COLOR_MAP: Record<string, ColorVariant> = Object.fromEntries(
  Object.entries(COLOR_HEX_MAP).map(([k, v]) => [v, k as ColorVariant])
);

export const OrderStatusCreateEditModal: React.FC = () => {
  const { payload, closeModal } = useModal();
  const { handleCreate, handleUpdate, isLoading, orderStatuses } = useOrderStatus();

  const existing = payload.orderStatus as OrderStatus | undefined;
  const isEdit = Boolean(existing);

  const [label, setLabel] = useState(existing?.label ?? "");
  const [code, setCode] = useState(existing?.code ?? "");
  const [codeManual, setCodeManual] = useState(false);
  const [colorHex, setColorHex] = useState(existing ? COLOR_HEX_MAP[existing.color] : COLOR_HEX_MAP.gray);
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? false);
  const [isFinal, setIsFinal] = useState(existing?.isFinal ?? false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleLabelChange = (v: string) => {
    setLabel(v);
    if (!codeManual) setCode(generateCode(v));
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!isRequired(label)) e.label = "Label is required";
    if (!isRequired(colorHex)) e.color = "Color is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const color: ColorVariant = HEX_COLOR_MAP[colorHex] ?? "gray";
    const sortOrder = existing?.sortOrder ?? orderStatuses.length;
    const data = { label, code: code || generateCode(label), color, isDefault, isFinal, sortOrder };
    if (isEdit && existing) {
      await handleUpdate(existing.id, data);
    } else {
      await handleCreate(data);
    }
  };

  return (
    <ResponsiveModal open onOpenChange={closeModal} title={isEdit ? "Edit Order Status" : "Create Order Status"}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Label</Label>
          <Input value={label} onChange={(e) => handleLabelChange(e.target.value)} placeholder="Status label" />
          {errors.label && <span className="text-xs text-destructive">{errors.label}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Code</Label>
          <Input value={code} onChange={(e) => { setCode(e.target.value); setCodeManual(true); }} placeholder="STATUS_CODE" className=" text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Color</Label>
          <ColorPicker value={colorHex} onChange={setColorHex} presets={Object.values(COLOR_HEX_MAP)} />
          {errors.color && <span className="text-xs text-destructive">{errors.color}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
            <Label>Default</Label>
          </div>
          {isDefault && <span className="text-xs text-muted-foreground">Enabling this will unset the current default</span>}
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isFinal} onCheckedChange={setIsFinal} />
          <Label>Final Status</Label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
