import React, { useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NumberInput } from "@/components/common/NumberInput";
import { useModal } from "@/hooks/useModal";
import { useTaxClass } from "@/hooks/useTaxClass";
import { isRequired, isPositiveNumber, isWithinRange } from "@/lib/validators";
import type { TaxClass, FormErrors } from "@/types/master.types";
import { Loader2 } from "lucide-react";

export const TaxClassCreateEditModal: React.FC = () => {
  const { payload, closeModal } = useModal();
  const { handleCreate, handleUpdate, isLoading } = useTaxClass();

  const existing = payload.taxClass as TaxClass | undefined;
  const isEdit = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? "");
  const [rate, setRate] = useState(existing?.rate ?? 0);
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? false);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!isRequired(name)) e.name = "Name is required";
    if (!isWithinRange(Number(rate), 0, 100)) e.rate = "Rate must be between 0 and 100";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const data = { name, rate, isDefault, isActive };
    if (isEdit && existing) {
      await handleUpdate(existing.id, data);
    } else {
      await handleCreate(data);
    }
  };

  return (
    <ResponsiveModal open onOpenChange={closeModal} title={isEdit ? "Edit Tax Class" : "Create Tax Class"}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tax class name" />
          {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Rate</Label>
          <NumberInput value={rate} onChange={setRate} min={0} max={100} suffix="%" />
          {errors.rate && <span className="text-xs text-destructive">{errors.rate}</span>}
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
