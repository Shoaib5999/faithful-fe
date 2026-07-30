import React, { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SearchSelector } from "@/components/common/SearchSelector";
import { useModal } from "@/hooks/useModal";
import { useCategory } from "@/hooks/useCategory";
import { useMasterData } from "@/hooks/useMasterData";
import { generateSlug } from "@/lib/formatters";
import { isRequired } from "@/lib/validators";
import { getCategoryDisplayName, getTopLevel } from "@/services/category-service";
import type { Category, FormErrors } from "@/types/master.types";
import type { SelectOption } from "@/types/common.types";
import { Loader2 } from "lucide-react";

export const CategoryCreateEditModal: React.FC = () => {
  const { payload, closeModal } = useModal();
  const { handleCreate, handleUpdate, isLoading } = useCategory();
  const { categories } = useMasterData();

  const existing = payload.category as Category | undefined;
  const isEdit = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [slugManual, setSlugManual] = useState(false);
  const [parentId, setParentId] = useState<string | null>(existing?.parentId ?? null);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!slugManual && !isEdit) {
      setSlug(generateSlug(name));
    }
  }, [name, slugManual, isEdit]);

  const topLevelOptions: SelectOption[] = getTopLevel(categories)
    .filter((c) => c.id !== existing?.id)
  .map((c) => ({ label: getCategoryDisplayName(c), value: c.id }));

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!isRequired(name)) e.name = "Name is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const data = { name, slug: slug || generateSlug(name), parentId, isActive, sortOrder: existing?.sortOrder ?? categories.length };
    if (isEdit && existing) {
      await handleUpdate(existing.id, data);
    } else {
      await handleCreate(data);
    }
  };

  return (
    <ResponsiveModal open onOpenChange={closeModal} title={isEdit ? "Edit Category" : "Create Category"}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Parent Category</Label>
          <SearchSelector
            options={topLevelOptions}
            value={parentId}
            onChange={setParentId}
            placeholder="None (Top Level)"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Slug</Label>
          <Input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
            placeholder="category-slug"
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
