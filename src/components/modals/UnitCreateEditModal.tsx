import React, { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModal } from "@/hooks/useModal";
import { useUnit } from "@/hooks/useUnit";
import { generateSlug } from "@/lib/formatters";
import { isRequired } from "@/lib/validators";
import type { Unit, FormErrors } from "@/types/master.types";
import { Loader2 } from "lucide-react";

export const UnitCreateEditModal: React.FC = () => {
  const { payload, closeModal } = useModal();
  const { handleCreate, handleUpdate, isLoading } = useUnit();

  const existing = payload.unit as Unit | undefined;
  const isEdit = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? "");
  const [symbol, setSymbol] = useState(existing?.symbol ?? "");
  const [type, setType] = useState<Unit["type"]>(existing?.type ?? "count");
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!isEdit && name) {
      setSymbol(generateSlug(name));
    }
  }, [name, isEdit]);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!isRequired(name)) e.name = "Name is required";
    if (!isRequired(symbol)) e.symbol = "Symbol is required";
    if (!isRequired(type)) e.type = "Type is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (isEdit && existing) {
      await handleUpdate(existing.id, { name, symbol, type, isActive });
    } else {
      await handleCreate({ name, symbol, type, isActive });
    }
  };

  return (
    <ResponsiveModal open onOpenChange={closeModal} title={isEdit ? "Edit Unit" : "Create Unit"}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kilogram" />
          {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Symbol</Label>
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="e.g. kg" />
          {!isEdit && name && <span className="text-xs text-muted-foreground">Suggested: {generateSlug(name)}</span>}
          {errors.symbol && <span className="text-xs text-destructive">{errors.symbol}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as Unit["type"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="count">Count</SelectItem>
              <SelectItem value="length">Length</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <span className="text-xs text-destructive">{errors.type}</span>}
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
