import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { updateHomeImage, createHomeImage } from "@/services/home-image-service";
import { useNotification } from "@/hooks/useNotification";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { HomeImage } from "@/types/cms.types";
import { AdminImageUpload } from "@/components/common/AdminImageUpload";
import { HOME_IMAGE_SPECS } from "@/constants/cms.constants";
import { uploadCategoryImage } from "@/services/upload-service";

const getSpecsForSection = (section: HomeImage["section"]) => {
  if (section === "promo-banners") return HOME_IMAGE_SPECS.banner;
  if (section === "brand-intro") return HOME_IMAGE_SPECS.landscape;
  return HOME_IMAGE_SPECS.portrait;
};

export const HomeImageEditModal: React.FC = () => {
  const { activeKey, payload, closeModal } = useModal();
  const { notify } = useNotification();
  const homeImage = payload?.homeImage as HomeImage | undefined;
  const createSection = payload?.section as HomeImage["section"] | undefined;
  const onSaved = payload?.onSaved as (() => void) | undefined;
  const isCreateMode = !homeImage;
  const section = homeImage?.section ?? createSection;

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUrlMobile, setImageUrlMobile] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const specs = useMemo(
    () => (section ? getSpecsForSection(section) : HOME_IMAGE_SPECS.portrait),
    [section],
  );

  useEffect(() => {
    if (homeImage) {
      setTitle(homeImage.title);
      setSubtitle(homeImage.subtitle);
      setImageUrl(homeImage.imageUrl);
      setImageUrlMobile(homeImage.imageUrlMobile);
      setLinkUrl(homeImage.linkUrl);
      setIsActive(homeImage.isActive);
    } else {
      setTitle("");
      setSubtitle("");
      setImageUrl(null);
      setImageUrlMobile(null);
      setLinkUrl("");
      setIsActive(true);
    }
  }, [homeImage, activeKey]);

  const handleSave = async () => {
    if (!homeImage && !section) return;
    if (isCreateMode && !title.trim()) return;
    setSaving(true);
    try {
      if (homeImage) {
        await updateHomeImage(homeImage.id, {
          title,
          subtitle,
          imageUrl,
          imageUrlMobile,
          linkUrl,
          isActive,
        });
        notify("Homepage image updated", "success");
      } else if (section) {
        await createHomeImage({
          section,
          title,
          subtitle,
          imageUrl,
          imageUrlMobile,
          linkUrl,
          isActive,
        });
        notify("Homepage image added", "success");
      }
      onSaved?.();
      closeModal();
    } catch {
      notify("Failed to save homepage image", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModal
      open={activeKey === "HomeImageEdit"}
      onOpenChange={() => closeModal()}
      title={homeImage ? `Edit ${homeImage.title}` : "Add homepage image"}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Subtitle</Label>
          <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </div>
        <AdminImageUpload
          label="Desktop image"
          value={imageUrl}
          onChange={(url) => setImageUrl(url)}
          onUpload={async (file) => {
            const result = await uploadCategoryImage(file);
            return { url: result.url, storageKey: result.storageKey };
          }}
          hint={specs.hint}
        />
        <AdminImageUpload
          label="Mobile image"
          value={imageUrlMobile}
          onChange={(url) => setImageUrlMobile(url)}
          onUpload={async (file) => {
            const result = await uploadCategoryImage(file);
            return { url: result.url, storageKey: result.storageKey };
          }}
          hint={HOME_IMAGE_SPECS.mobile.hint}
        />
        <div className="flex flex-col gap-1">
          <Label>Link URL</Label>
          <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Active</Label>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || (!homeImage && !section) || (isCreateMode && !title.trim())}
          >
            {saving ? "Saving..." : isCreateMode ? "Add" : "Update"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
