import React, { useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { useCustomer } from "@/hooks/useCustomer";
import { InlineAlert } from "@/components/common/InlineAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Address } from "@/types/commerce.types";
import type { FormErrors } from "@/types/master.types";

export const AddressCreateEditModal: React.FC = () => {
  const { closeModal, payload } = useModal();
  const { handleAddAddress, handleUpdateAddress } = useCustomer();

  const customerId = payload.customerId as string;
  const existing = payload.address as Address | undefined;
  const isEdit = !!existing;

  const [label, setLabel] = useState(existing?.label ?? "");
  const [line1, setLine1] = useState(existing?.line1 ?? "");
  const [line2, setLine2] = useState(existing?.line2 ?? "");
  const [city, setCity] = useState(existing?.city ?? "");
  const [state, setState] = useState(existing?.state ?? "");
  const [postalCode, setPostalCode] = useState(existing?.postalCode ?? "");
  const [country, setCountry] = useState(existing?.country ?? "India");
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const e: FormErrors = {};
    if (!label.trim()) e.label = "Label is required";
    if (!line1.trim()) e.line1 = "Address line 1 is required";
    if (!city.trim()) e.city = "City is required";
    if (!state.trim()) e.state = "State is required";
    if (!postalCode.trim()) e.postalCode = "Postal code is required";
    if (!country.trim()) e.country = "Country is required";
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    const data = { label, line1, line2: line2 || null, city, state, postalCode, country, isDefault };

    if (isEdit && existing) {
      await handleUpdateAddress(customerId, existing.id, data);
    } else {
      await handleAddAddress(customerId, data);
    }
    setSaving(false);
    closeModal();
  };

  return (
    <ResponsiveModal open onOpenChange={() => closeModal()} title={isEdit ? "Edit Address" : "Add Address"}>
      <div className="flex flex-col gap-4 p-1">
        <div className="flex flex-col gap-1.5">
          <Label>Label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home, Office..." />
          {errors.label && <InlineAlert type="error" message={errors.label} />}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Address Line 1</Label>
          <Input value={line1} onChange={(e) => setLine1(e.target.value)} />
          {errors.line1 && <InlineAlert type="error" message={errors.line1} />}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Address Line 2</Label>
          <Input value={line2} onChange={(e) => setLine2(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
            {errors.city && <InlineAlert type="error" message={errors.city} />}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>State</Label>
            <Input value={state} onChange={(e) => setState(e.target.value)} />
            {errors.state && <InlineAlert type="error" message={errors.state} />}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Postal Code</Label>
            <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            {errors.postalCode && <InlineAlert type="error" message={errors.postalCode} />}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Country</Label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isDefault} onCheckedChange={setIsDefault} />
          <Label>Default Address</Label>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : isEdit ? "Update" : "Add"}</Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
