import React, { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useModal } from "@/hooks/useModal";
import { createSlider, updateSlider } from "@/services/slider-service";
import { useNotification } from "@/hooks/useNotification";
import { NumberInput } from "@/components/common/NumberInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import type { Slider } from "@/types/cms.types";
import { AdminImageUpload } from "@/components/common/AdminImageUpload";
import { SLIDER_IMAGE_SPECS } from "@/constants/cms.constants";
import { uploadSliderImage } from "@/services/upload-service";

export const SliderCreateEditModal: React.FC = () => {
  const { activeKey, payload, closeModal } = useModal();
  const { notify } = useNotification();
  const slider = payload?.slider as Slider | undefined;
  const onSaved = payload?.onSaved as (() => void) | undefined;
  const isEdit = Boolean(slider);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUrlMobile, setImageUrlMobile] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slider) {
      setTitle(slider.title);
      setSubtitle(slider.subtitle);
      setImageUrl(slider.imageUrl);
      setImageUrlMobile(slider.imageUrlMobile);
      setLinkUrl(slider.linkUrl);
      setLinkLabel(slider.linkLabel);
      setStartDate(slider.startDate ? new Date(slider.startDate) : undefined);
      setEndDate(slider.endDate ? new Date(slider.endDate) : undefined);
      setIsActive(slider.isActive);
      setSortOrder(slider.sortOrder);
      return;
    }

    setTitle("");
    setSubtitle("");
    setImageUrl(null);
    setImageUrlMobile(null);
    setLinkUrl("/collection");
    setLinkLabel("Discover Collection");
    setStartDate(undefined);
    setEndDate(undefined);
    setIsActive(true);
    setSortOrder(0);
  }, [slider, activeKey]);

  const handleSave = async () => {
    setSaving(true);
    const data = {
      title,
      subtitle,
      imageUrl,
      imageUrlMobile,
      linkUrl,
      linkLabel,
      startDate: startDate?.toISOString() ?? null,
      endDate: endDate?.toISOString() ?? null,
      isActive,
      sortOrder,
    };
    try {
      if (isEdit && slider) {
        await updateSlider(slider.id, data);
      } else {
        await createSlider(data);
      }
      onSaved?.();
      notify(isEdit ? "Slider updated" : "Slider created", "success");
      closeModal();
    } catch {
      notify("Failed to save slider", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModal open={activeKey === "SliderCreateEdit"} onOpenChange={() => closeModal()} title={isEdit ? "Edit Slider" : "Create Slider"}>
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
            const result = await uploadSliderImage(file);
            return { url: result.url, storageKey: result.storageKey };
          }}
          hint={SLIDER_IMAGE_SPECS.desktop.hint}
        />
        <AdminImageUpload
          label="Mobile image"
          value={imageUrlMobile}
          onChange={(url) => setImageUrlMobile(url)}
          onUpload={async (file) => {
            const result = await uploadSliderImage(file);
            return { url: result.url, storageKey: result.storageKey };
          }}
          hint={`${SLIDER_IMAGE_SPECS.mobile.hint}. Uses desktop if empty.`}
        />
        <div className="flex flex-col gap-1">
          <Label>Link URL</Label>
          <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Link Label</Label>
          <Input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} />
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
        <div className="flex flex-col gap-1">
          <Label>Sort Order</Label>
          <NumberInput value={sortOrder} onChange={setSortOrder} min={0} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => closeModal()}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : isEdit ? "Update" : "Create"}</Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
