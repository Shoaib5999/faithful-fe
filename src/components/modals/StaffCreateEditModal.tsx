import React, { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { useStaff } from "@/hooks/useStaff";
import { InlineAlert } from "@/components/common/InlineAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { Staff } from "@/types/staff.types";

export const StaffCreateEditModal: React.FC = () => {
  const { activeKey, payload, closeModal } = useModal();
  const { handleCreate, handleUpdate } = useStaff();
  const staff = payload?.staff as Staff | undefined;
  const isEdit = Boolean(staff);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      setFirstName(staff.firstName);
      setLastName(staff.lastName);
      setEmail(staff.email);
      setPhone(staff.phone);
      setRole(staff.role);
      setIsActive(staff.isActive);
    }
  }, [staff]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!email.trim()) errs.email = "Email is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    if (isEdit && staff) {
      await handleUpdate(staff.id, { firstName, lastName, email, phone, role, isActive });
    } else {
      await handleCreate({
        firstName,
        lastName,
        email,
        phone,
        role,
        isActive,
        avatarUrl: null,
        permissions: [],
      });
    }
    setSaving(false);
    closeModal();
  };

  return (
    <ResponsiveModal
      open={activeKey === "StaffCreateEdit"}
      onOpenChange={() => closeModal()}
      title={isEdit ? "Edit Staff" : "Create Staff"}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label>First Name</Label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          {errors.firstName && <InlineAlert type="error" message={errors.firstName} />}
        </div>
        <div className="flex flex-col gap-1">
          <Label>Last Name</Label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          {errors.lastName && <InlineAlert type="error" message={errors.lastName} />}
        </div>
        <div className="flex flex-col gap-1">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          {errors.email && <InlineAlert type="error" message={errors.email} />}
        </div>
        <div className="flex flex-col gap-1">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Role</Label>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Manager, Cashier"
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Active</Label>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
