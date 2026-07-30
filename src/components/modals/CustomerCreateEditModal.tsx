import React, { useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { useCustomer } from "@/hooks/useCustomer";
import { InlineAlert } from "@/components/common/InlineAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Customer, CustomerType, CustomerGroup } from "@/types/commerce.types";
import type { FormErrors } from "@/types/master.types";

export const CustomerCreateEditModal: React.FC = () => {
  const { closeModal, payload } = useModal();
  const { handleCreate, handleUpdate } = useCustomer();

  const existing = payload.customer as Customer | undefined;
  const isEdit = !!existing;

  const [firstName, setFirstName] = useState(existing?.firstName ?? "");
  const [lastName, setLastName] = useState(existing?.lastName ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [type, setType] = useState<CustomerType>(existing?.type ?? "online");
  const [group, setGroup] = useState<CustomerGroup>(existing?.group ?? "retail");
  const [gstNumber, setGstNumber] = useState(existing?.gstNumber ?? "");
  const [gstBusinessName, setGstBusinessName] = useState(existing?.gstBusinessName ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const e: FormErrors = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!email.trim() && !phone.trim()) e.email = "At least one of email or phone is required";
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    const data = {
      firstName, lastName, email: email || null, phone: phone || null,
      type, group, gstNumber: gstNumber || null, gstBusinessName: gstBusinessName || null,
      notes: notes || null, isActive,
    };

    if (isEdit && existing) {
      await handleUpdate(existing.id, data);
    } else {
      await handleCreate(data);
    }
    setSaving(false);
    closeModal();
  };

  return (
    <ResponsiveModal open onOpenChange={() => closeModal()} title={isEdit ? "Edit Customer" : "Create Customer"}>
      <div className="flex flex-col gap-4 p-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            {errors.firstName && <InlineAlert type="error" message={errors.firstName} />}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Last Name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            {errors.email && <InlineAlert type="error" message={errors.email} />}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as CustomerType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="walkin">Walk-in</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Group</Label>
            <Select value={group} onValueChange={(v) => setGroup(v as CustomerGroup)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {(group === "wholesale" || group === "vip") && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>GST Number</Label>
              <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
            </div>
            {gstNumber && (
              <div className="flex flex-col gap-1.5">
                <Label>GST Business Name</Label>
                <Input value={gstBusinessName} onChange={(e) => setGstBusinessName(e.target.value)} />
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Active</Label>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : isEdit ? "Update" : "Create"}</Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
