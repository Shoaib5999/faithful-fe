import React, { useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useModal } from "@/hooks/useModal";
import { useCurrency } from "@/hooks/useCurrency";
import { isRequired } from "@/lib/validators";
import type { Currency, FormErrors } from "@/types/master.types";
import { Loader2 } from "lucide-react";

export const CurrencyCreateEditModal: React.FC = () => {
  const { payload, closeModal } = useModal();
  const { handleCreate, handleUpdate, isLoading } = useCurrency();

  const existing = payload.currency as Currency | undefined;
  const isEdit = Boolean(existing);

  const [code, setCode] = useState(existing?.code ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [symbol, setSymbol] = useState(existing?.symbol ?? "");
  const [symbolPosition, setSymbolPosition] = useState<"before" | "after">(existing?.symbolPosition ?? "before");
  const [decimalSeparator, setDecimalSeparator] = useState(existing?.decimalSeparator ?? ".");
  const [thousandSeparator, setThousandSeparator] = useState(existing?.thousandSeparator ?? ",");
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? false);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!isRequired(code)) e.code = "Code is required";
    if (!isRequired(name)) e.name = "Name is required";
    if (!isRequired(symbol)) e.symbol = "Symbol is required";
    return e;
  };

  const formatPreview = (): string => {
    const amount = "1234.56";
    const [whole, dec] = amount.split(".");
    const formatted = `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)}${decimalSeparator}${dec}`;
    return symbolPosition === "before" ? `${symbol}${formatted}` : `${formatted}${symbol}`;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const data = { code: code.toUpperCase(), name, symbol, symbolPosition, decimalSeparator, thousandSeparator, isDefault, isActive };
    if (isEdit && existing) {
      await handleUpdate(existing.id, data);
    } else {
      await handleCreate(data);
    }
  };

  return (
    <ResponsiveModal open onOpenChange={closeModal} title={isEdit ? "Edit Currency" : "Create Currency"}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Code</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="USD" maxLength={3} />
          {errors.code && <span className="text-xs text-destructive">{errors.code}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="US Dollar" />
          {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Symbol</Label>
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="$" />
          {errors.symbol && <span className="text-xs text-destructive">{errors.symbol}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Position</Label>
          <RadioGroup value={symbolPosition} onValueChange={(v) => setSymbolPosition(v as "before" | "after")} className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="before" id="pos-before" />
              <Label htmlFor="pos-before">Before amount</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="after" id="pos-after" />
              <Label htmlFor="pos-after">After amount</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Decimal Separator</Label>
            <Input value={decimalSeparator} onChange={(e) => setDecimalSeparator(e.target.value.slice(0, 1))} maxLength={1} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Thousand Separator</Label>
            <Input value={thousandSeparator} onChange={(e) => setThousandSeparator(e.target.value.slice(0, 1))} maxLength={1} />
          </div>
        </div>
        <div className="rounded-md border border-border bg-muted/50 p-3">
          <span className="text-xs text-muted-foreground">Preview: </span>
          <span className="text-sm font-semibold">{formatPreview()}</span>
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
