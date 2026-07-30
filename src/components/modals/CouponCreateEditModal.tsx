import React, { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { useCoupon } from "@/hooks/useCoupon";
import { InlineAlert } from "@/components/common/InlineAlert";
import { NumberInput } from "@/components/common/NumberInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { generateCouponCode } from "@/services/coupon-service";
import type { Coupon, CouponType } from "@/types/coupon.types";

export const CouponCreateEditModal: React.FC = () => {
  const { activeKey, payload, closeModal } = useModal();
  const { handleCreate, handleUpdate } = useCoupon();
  const coupon = payload?.coupon as Coupon | undefined;
  const isEdit = Boolean(coupon);

  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percent");
  const [value, setValue] = useState(0);
  const [minOrder, setMinOrder] = useState<number | null>(null);
  const [maxUses, setMaxUses] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [expiresPickerOpen, setExpiresPickerOpen] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setType(coupon.type);
      setValue(coupon.value);
      setMinOrder(coupon.minOrder);
      setMaxUses(coupon.maxUses);
      setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt) : undefined);
      setIsActive(coupon.isActive);
    }
  }, [coupon]);

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!code.trim()) errs.code = "Code is required";
    if (!type) errs.type = "Type is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      if (isEdit && coupon) {
        await handleUpdate(coupon.id, {
          isActive,
          maxUses,
          minOrder,
          expiresAt: expiresAt ? expiresAt.toISOString() : null,
        });
      } else {
        await handleCreate({
          code: code.toUpperCase(),
          type,
          value,
          minOrder,
          maxUses,
          isActive: true,
          expiresAt: expiresAt ? expiresAt.toISOString() : null,
        });
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModal open={activeKey === "CouponCreateEdit"} onOpenChange={() => closeModal()} title={isEdit ? "Edit Coupon" : "Create Coupon"}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label>Code</Label>
          <div className="flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="" disabled={isEdit} />
            {!isEdit && (
              <Button variant="outline" size="icon" onClick={() => setCode(generateCouponCode())}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          {errors.code && <InlineAlert type="error" message={errors.code} />}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Type</Label>
          <RadioGroup value={type} onValueChange={(v) => setType(v as CouponType)} className="flex gap-4" disabled={isEdit}>
            <div className="flex items-center gap-2"><RadioGroupItem value="flat" id="flat" /><Label htmlFor="flat">Flat</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem value="percent" id="percent" /><Label htmlFor="percent">Percent</Label></div>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Value</Label>
          <NumberInput
            value={value}
            onChange={setValue}
            min={0}
            disabled={isEdit}
            suffix={type === "percent" ? "%" : undefined}
            prefix={type === "flat" ? "₹" : undefined}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Min Order (optional)</Label>
          <NumberInput value={minOrder ?? 0} onChange={(v) => setMinOrder(v || null)} min={0} prefix="₹" />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Max Uses (optional)</Label>
          <NumberInput value={maxUses ?? 0} onChange={(v) => setMaxUses(v || null)} min={0} />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Expires</Label>
          <Popover open={expiresPickerOpen} onOpenChange={setExpiresPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start font-normal"
              >
                <CalendarDays className="mr-2 h-4 w-4 shrink-0" />
                {expiresAt ? format(expiresAt, "MMM d, yyyy") : "No expiry"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="z-100 w-auto p-0" align="start" sideOffset={8}>
              <Calendar
                mode="single"
                selected={expiresAt}
                onSelect={(date) => {
                  setExpiresAt(date);
                  if (date) setExpiresPickerOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Active</Label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => closeModal()}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : isEdit ? "Update" : "Create"}</Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
