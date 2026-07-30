import React, { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { useBanner } from "@/hooks/useBanner";
import { InlineAlert } from "@/components/common/InlineAlert";
import { NumberInput } from "@/components/common/NumberInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import type { Banner, BannerImage, BannerPosition } from "@/types/cms.types";
import { AdminR2MediaGallery } from "@/components/common/AdminR2MediaGallery";
import { bannerPayloadFromImages, mergeBannerImages } from "@/lib/banner-utils";
import { listAllUploadAssets } from "@/services/upload-service";

const POSITIONS: { label: string; value: BannerPosition }[] = [
  { label: "Homepage Top", value: "homepage_top" },
  { label: "Homepage Middle", value: "homepage_middle" },
  { label: "Sidebar", value: "sidebar" },
  { label: "Category Page", value: "category_page" },
  { label: "Product Page", value: "product_page" },
];

export const BannerCreateEditModal: React.FC = () => {
  const { activeKey, payload, closeModal } = useModal();
  const { handleCreate, handleUpdate } = useBanner();
  const banner = payload?.banner as Banner | undefined;
  const isEdit = Boolean(banner);

  const [name, setName] = useState("");
  const [position, setPosition] = useState<BannerPosition>("homepage_top");
  const [images, setImages] = useState<BannerImage[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loadingR2, setLoadingR2] = useState(false);

  useEffect(() => {
    if (!banner) {
      setImages([]);
      return;
    }

    setName(banner.name);
    setPosition(banner.position);
    setImages(banner.images ?? []);
    setLinkUrl(banner.linkUrl);
    setWidth(banner.width);
    setHeight(banner.height);
    setStartDate(banner.startDate ? new Date(banner.startDate) : undefined);
    setEndDate(banner.endDate ? new Date(banner.endDate) : undefined);
    setIsActive(banner.isActive);

    let cancelled = false;
    setLoadingR2(true);

    void listAllUploadAssets("banners")
      .then((resources) => {
        if (cancelled) return;
        const fromR2: BannerImage[] = resources.map((r) => ({
          url: r.url,
          storageKey: r.storageKey,
        }));
        setImages((prev) => mergeBannerImages(banner.images, fromR2, prev));
      })
      .finally(() => {
        if (!cancelled) setLoadingR2(false);
      });

    return () => {
      cancelled = true;
    };
  }, [banner]);

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!position) errs.position = "Position is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const payloadData = bannerPayloadFromImages(images, {
      name,
      position,
      linkUrl,
      width,
      height,
      startDate: startDate?.toISOString() ?? null,
      endDate: endDate?.toISOString() ?? null,
      isActive,
    });

    if (isEdit && banner) {
      await handleUpdate(banner.id, payloadData);
    } else {
      await handleCreate(payloadData);
    }
    setSaving(false);
    closeModal();
  };

  return (
    <ResponsiveModal
      open={activeKey === "BannerCreateEdit"}
      onOpenChange={() => closeModal()}
      title={isEdit ? "Edit Banner" : "Create Banner"}
      className="sm:max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <InlineAlert type="error" message={errors.name} />}
        </div>
        <div className="flex flex-col gap-1">
          <Label>Position</Label>
          <Select value={position} onValueChange={(v) => setPosition(v as BannerPosition)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {POSITIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.position && <InlineAlert type="error" message={errors.position} />}
          <p className="text-xs text-muted-foreground">
            Homepage Top images appear in the store hero slider. Homepage Middle shows as a promo strip on the home page.
          </p>
        </div>

        {loadingR2 ? (
          <p className="text-sm text-muted-foreground">Loading images from R2…</p>
        ) : (
          <AdminR2MediaGallery
            label="Banner images (R2)"
            images={images}
            onChange={setImages}
            hint="First image is the table preview. All images in this list are used on the storefront for the selected position when the banner is active."
          />
        )}

        <div className="flex flex-col gap-1">
          <Label>Link URL</Label>
          <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/collection" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label>Width</Label>
            <NumberInput value={width} onChange={setWidth} min={1} />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Height</Label>
            <NumberInput value={height} onChange={setHeight} min={1} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start font-normal">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM d, yyyy") : "Select"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start font-normal">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM d, yyyy") : "Select"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Active</Label>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => closeModal()}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || loadingR2}>
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
