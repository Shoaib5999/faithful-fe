import React, { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useModal } from "@/hooks/useModal";
import { useBrand } from "@/hooks/useBrand";
import { generateSlug } from "@/lib/formatters";
import { isRequired } from "@/lib/validators";
import type { Brand, FormErrors } from "@/types/master.types";
import { AdminImageUpload } from "@/components/common/AdminImageUpload";
import { uploadBrandLogo } from "@/services/upload-service";
import { Loader2 } from "lucide-react";

export const BrandCreateEditModal: React.FC = () => {
  const { payload, closeModal } = useModal();
  const { handleCreate, handleUpdate, isLoading } = useBrand();

  const existing = payload.brand as Brand | undefined;
  const isEdit = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [slugManual, setSlugManual] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(existing?.logoUrl ?? null);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!slugManual) {
      setSlug(generateSlug(name));
    }
  }, [name, slugManual]);

  useEffect(() => {
    setSlugManual(false);
  }, [existing?.id]);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!isRequired(name)) e.name = "Name is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const data = { name, slug: slug || generateSlug(name), logoUrl, isActive };
    if (isEdit && existing) {
      await handleUpdate(existing.id, data);
    } else {
      await handleCreate(data);
    }
  };

  return (
    <ResponsiveModal open onOpenChange={closeModal} title={isEdit ? "Edit Brand" : "Create Brand"}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Brand name" />
          {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
        </div>
        <AdminImageUpload
          label="Brand logo"
          value={logoUrl}
          onChange={(url) => setLogoUrl(url)}
          onUpload={async (file) => {
            const result = await uploadBrandLogo(file);
            return { url: result.url, storageKey: result.storageKey };
          }}
          hint="Saved to R2 under logos/"
        />
        <div className="flex flex-col gap-1.5">
          <Label>Slug</Label>
          <Input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
            placeholder="brand-slug"
            className=" text-muted-foreground"
          />
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
