import React, { useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useModal } from "@/hooks/useModal";
import { useCutType } from "@/hooks/useCutType";
import { generateSlug } from "@/lib/formatters";
import { isRequired } from "@/lib/validators";
import type { CutType } from "@/types/cut-type.types";
import type { FormErrors } from "@/types/master.types";
import { AdminImageUpload } from "@/components/common/AdminImageUpload";
import { uploadCutTypeImage } from "@/services/upload-service";
import { Loader2 } from "lucide-react";

export const CutTypeCreateEditModal: React.FC = () => {
  const { payload, closeModal } = useModal();
  const { handleCreate, handleUpdate, isLoading } = useCutType();

  const existing = payload?.cutType as CutType | undefined;
  const onSaved = payload?.onSaved as (() => void) | undefined;
  const isEdit = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(existing?.imageUrl ?? null);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSave = async () => {
    const e: FormErrors = {};
    if (!isRequired(name)) e.name = "Name is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const data = {
      name: name.trim(),
      slug: generateSlug(name),
      imageUrl,
      isActive,
    };

    const ok =
      isEdit && existing
        ? await handleUpdate(existing.id, data)
        : await handleCreate(data);

    if (!ok) return;
    onSaved?.();
    closeModal();
  };

  return (
    <ResponsiveModal
      open
      onOpenChange={closeModal}
      title={isEdit ? "Edit cut type" : "Add cut type"}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Curry Cut"
          />
          {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
        </div>

        <AdminImageUpload
          label="Theme image"
          value={imageUrl}
          onChange={setImageUrl}
          allowUrl
          onUpload={async (file) => {
            const result = await uploadCutTypeImage(file);
            return { url: result.url, storageKey: result.storageKey };
          }}
          hint="Shown on homepage discovery. Recommended 400×400 px. Avoid renaming existing types in production."
        />

        <div className="flex items-center gap-2">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Active</Label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
